using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

internal static class Launcher
{
    private const string BuildId = "B-TRIO-007-UX01";
    private const int DefaultPort = 4173;

    private static readonly Dictionary<string, string> MimeTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".html", "text/html; charset=utf-8" },
            { ".mjs", "text/javascript; charset=utf-8" },
            { ".js", "text/javascript; charset=utf-8" },
            { ".css", "text/css; charset=utf-8" },
            { ".json", "application/json; charset=utf-8" },
            { ".svg", "image/svg+xml" }, { ".png", "image/png" },
            { ".jpg", "image/jpeg" }, { ".jpeg", "image/jpeg" },
            { ".webp", "image/webp" }, { ".woff2", "font/woff2" }
        };

    private static int Main(string[] args)
    {
        bool noBrowser = Array.IndexOf(args, "--no-browser") >= 0;
        Console.OutputEncoding = Encoding.UTF8;
        try
        {
            Console.Title = "津彩入画";
            string build = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "源代码", "builds", BuildId);
            Dictionary<string, string> routes = LoadRoutes(build);
            TcpListener listener = OpenListener();
            bool stopping = false;
            Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs e)
            {
                e.Cancel = true;
                Volatile.Write(ref stopping, true);
                listener.Stop();
            };

            try
            {
                string url = "http://127.0.0.1:" + ((IPEndPoint)listener.LocalEndpoint).Port + "/";
                Console.WriteLine("津彩入画已启动");
                Console.WriteLine(url);
                Console.WriteLine("体验期间请保持此窗口开启，结束后可关闭窗口。");
                if (!noBrowser)
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                    }
                    catch (Exception ex)
                    {
                        if (!(ex is System.ComponentModel.Win32Exception) && !(ex is InvalidOperationException))
                            throw;
                        Console.WriteLine("请将上方地址复制到浏览器打开。");
                    }
                }

                while (!Volatile.Read(ref stopping))
                {
                    TcpClient client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(delegate { Handle(client, routes); });
                }
            }
            catch (SocketException)
            {
                if (!Volatile.Read(ref stopping)) throw;
            }
            finally
            {
                listener.Stop();
            }
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("作品未能打开。请确认已完整解压 ZIP，并从解压目录双击启动。");
            Console.Error.WriteLine(ex.Message);
            if (!noBrowser && !Console.IsInputRedirected) Console.ReadLine();
            return 1;
        }
    }

    private static TcpListener OpenListener()
    {
        TcpListener listener = new TcpListener(IPAddress.Loopback, DefaultPort);
        listener.ExclusiveAddressUse = true;
        try
        {
            listener.Start();
        }
        catch (SocketException error)
        {
            listener.Stop();
            if (error.SocketErrorCode != SocketError.AddressAlreadyInUse &&
                error.SocketErrorCode != SocketError.AccessDenied) throw;
            listener = new TcpListener(IPAddress.Loopback, 0);
            listener.ExclusiveAddressUse = true;
            listener.Start();
        }
        return listener;
    }

    private static Dictionary<string, string> LoadRoutes(string build)
    {
        string root = Path.GetFullPath(build) + Path.DirectorySeparatorChar;
        string manifestFile = Path.Combine(root, "BUILD.json");
        JavaScriptSerializer json = new JavaScriptSerializer();
        var manifest = json.Deserialize<Dictionary<string, object>>(File.ReadAllText(manifestFile));
        if ((string)manifest["id"] != BuildId) throw new InvalidDataException("构建版本不一致。");

        var routes = new Dictionary<string, string>(StringComparer.Ordinal);
        using (SHA256 sha = SHA256.Create())
        {
            foreach (Dictionary<string, object> entry in (System.Collections.IEnumerable)manifest["files"])
            {
                string relative = (string)entry["path"];
                string file = Path.GetFullPath(Path.Combine(root, relative));
                if (!file.StartsWith(root, StringComparison.OrdinalIgnoreCase) || relative.IndexOf('\\') >= 0)
                    throw new InvalidDataException("构建清单含无效路径。");
                using (FileStream input = File.OpenRead(file))
                {
                    string hash = BitConverter.ToString(sha.ComputeHash(input)).Replace("-", "");
                    if (input.Length != Convert.ToInt64(entry["bytes"]) ||
                        !String.Equals(hash, (string)entry["sha256"], StringComparison.OrdinalIgnoreCase))
                        throw new InvalidDataException("构建文件校验失败：" + relative);
                }
                routes.Add("/" + relative, file);
            }
        }
        routes.Add("/", routes["/index.html"]);
        routes.Add("/BUILD.json", manifestFile);
        return routes;
    }

    private static void Handle(TcpClient client, Dictionary<string, string> routes)
    {
        using (client)
        {
            try
            {
                client.ReceiveTimeout = 3000;
                client.SendTimeout = 10000;
                NetworkStream stream = client.GetStream();
                string line = ReadRequestLine(stream);
                if (line == null) return;
                string[] parts = line.Split(' ');
                if (parts.Length != 3 || !parts[1].StartsWith("/", StringComparison.Ordinal)) return;
                bool head = parts[0] == "HEAD";
                if (!head && parts[0] != "GET")
                {
                    WriteHeaders(stream, "405 Method Not Allowed", "text/plain", 0);
                    return;
                }
                string route = Uri.UnescapeDataString(parts[1].Split('?')[0]);
                string file;
                if (!routes.TryGetValue(route, out file))
                {
                    WriteHeaders(stream, "404 Not Found", "text/plain", 0);
                    return;
                }
                string mime;
                if (!MimeTypes.TryGetValue(Path.GetExtension(file), out mime))
                    mime = "application/octet-stream";
                using (FileStream input = File.OpenRead(file))
                {
                    WriteHeaders(stream, "200 OK", mime, input.Length);
                    if (!head) input.CopyTo(stream);
                }
            }
            catch (IOException) { }
            catch (SocketException) { }
            catch (UriFormatException) { }
        }
    }

    private static string ReadRequestLine(NetworkStream stream)
    {
        var buffer = new byte[8192];
        int length = 0;
        int lineEnd = -1;
        while (length < buffer.Length)
        {
            int read = stream.Read(buffer, length, buffer.Length - length);
            if (read == 0) return null;
            int previous = length;
            length += read;
            for (int i = Math.Max(0, previous - 3); i + 1 < length; i++)
            {
                if (buffer[i] != 13 || buffer[i + 1] != 10) continue;
                if (lineEnd < 0) lineEnd = i;
                if (i + 3 < length && buffer[i + 2] == 13 && buffer[i + 3] == 10)
                    return Encoding.ASCII.GetString(buffer, 0, lineEnd);
            }
        }
        return null;
    }

    private static void WriteHeaders(NetworkStream stream, string status, string mime, long length)
    {
        byte[] bytes = Encoding.ASCII.GetBytes(
            "HTTP/1.1 " + status + "\r\nContent-Type: " + mime +
            "\r\nContent-Length: " + length +
            "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n");
        stream.Write(bytes, 0, bytes.Length);
    }
}
