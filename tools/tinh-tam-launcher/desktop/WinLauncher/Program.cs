using System.Diagnostics;
using System.Net.Http;
using System.Windows.Forms;

namespace TinhTamOnlineOpen;

internal static class Program
{
    private const string Url = "http://127.0.0.1:3388/";

    [STAThread]
    private static async Task Main()
    {
        try
        {
            string? game = FindGameFolder();
            if (game is null)
            {
                Error("Không tìm thấy game và tools\\tinh-tam-launcher\\launcher.cjs.\nHãy đặt TINH_TAM_ONLINE.exe trong thư mục gốc game-chua-moi.");
                return;
            }
            if (await IsLauncherReady())
            {
                OpenBrowser();
                return;
            }
            if (await IsPortBusy())
            {
                Error("Cổng 3388 đang được chương trình khác sử dụng. Hãy kiểm tra trước khi mở TĨNH TÂM Launcher.");
                return;
            }
            string? node = LocateNode();
            if (node is null)
            {
                Error("Không tìm thấy Node.js. Hãy cài Node.js LTS, sau đó mở lại TĨNH TÂM ONLINE.");
                return;
            }
            var launcher = Path.Combine(game, "tools", "tinh-tam-launcher", "launcher.cjs");
            var psi = new ProcessStartInfo
            {
                FileName = node,
                WorkingDirectory = game,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            psi.ArgumentList.Add(launcher);
            psi.ArgumentList.Add("--game");
            psi.ArgumentList.Add(game);
            psi.ArgumentList.Add("--no-open");
            // Reuse the installed Node's directory so npm will also resolve.
            var nodeDir = Path.GetDirectoryName(node);
            if (nodeDir != null)
                psi.Environment["PATH"] = nodeDir + Path.PathSeparator + (Environment.GetEnvironmentVariable("PATH") ?? "");
            using var child = Process.Start(psi);
            if (child is null) { Error("Không khởi động được Node.js."); return; }
            for (int i = 0; i < 50; i++)
            {
                await Task.Delay(200);
                if (await IsLauncherReady()) { OpenBrowser(); return; }
                if (child.HasExited) break;
            }
            Error("Launcher không khởi động được. Kiểm tra Node.js và xem nhật ký hệ thống.\nThư mục game: " + game);
        }
        catch (Exception ex)
        {
            Error("Không mở được TĨNH TÂM Launcher: " + ex.Message);
        }
    }

    private static string? FindGameFolder()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        for (int i = 0; current != null && i < 5; i++, current = current.Parent)
        {
            if (File.Exists(Path.Combine(current.FullName, "package.json")) &&
                File.Exists(Path.Combine(current.FullName, "tools", "tinh-tam-launcher", "launcher.cjs")) &&
                File.Exists(Path.Combine(current.FullName, "tools", "tinh-tam-launcher", "interface.html")))
                return current.FullName;
        }
        return null;
    }

    private static string? LocateNode()
    {
        var path = Environment.GetEnvironmentVariable("PATH") ?? "";
        foreach (var dir in path.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            try
            {
                var exe = Path.Combine(dir.Trim('"'), "node.exe");
                if (File.Exists(exe)) return exe;
            }
            catch { }
        }
        var common = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe");
        return File.Exists(common) ? common : null;
    }

    private static async Task<bool> IsLauncherReady()
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(700) };
            var html = await client.GetStringAsync(Url);
            return html.Contains("TĨNH TÂM ONLINE · Launcher") || html.Contains("TĨNH TÂM ONLINE · Launcher");
        }
        catch { return false; }
    }

    private static async Task<bool> IsPortBusy()
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(700) };
            using var response = await client.GetAsync(Url);
            return true;
        }
        catch { return false; }
    }

    private static void OpenBrowser()
    {
        Process.Start(new ProcessStartInfo { FileName = Url, UseShellExecute = true });
    }
    private static void Error(string message) =>
        MessageBox.Show(message, "TĨNH TÂM ONLINE", MessageBoxButtons.OK, MessageBoxIcon.Warning);
}
