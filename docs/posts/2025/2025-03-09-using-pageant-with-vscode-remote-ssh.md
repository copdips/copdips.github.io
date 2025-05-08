---
authors:
- copdips
categories:
- linux
- ssh
- vscode
comments: true
date:
  created: 2025-03-09
  updated: 2025-05-08
---

# Using Pageant with VSCode Remote SSH

While Putty and Pageant are widely used tools for SSH connections, you can also integrate Pageant with VSCode to establish remote SSH connections without administrative privileges. While the default [ssh-agent service](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_keymanagement) offers similar functionality, it's disabled by default and requires administrative access to start if disabled, making Pageant a more flexible alternative. Here's how you can set it up:

<!-- more -->

1. Install VSCode using the [User Installer](https://code.visualstudio.com/docs/?dv=win32arm64user).
2. Install the VSCode [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) extension.
3. Download [Pageant](https://the.earth.li/~sgtatham/putty/latest/w64/pageant.exe) and [PuTTYgen](https://the.earth.li/~sgtatham/putty/latest/w64/puttygen.exe).
4. Generate an [OpenSSH format SSH key pair](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) if you don't have one yet. Using a passphrase is highly recommended for security. After this step, you should have two files: `id_ed25519` (private key) and `id_ed25519.pub` (public key).
5. Run `puttygen`, open *Conversions* -> *Import key*, and load your OpenSSH format private key (the one without the `.pub` extension) created in the previous step. This file is typically located in the `%userprofile%\.ssh` folder. Export it to `ppk` format by clicking the *Save private key* button. This conversion is necessary because Pageant only accepts keys in `ppk` format. Save it as `%userprofile%\.ssh\id_ed25519.ppk`.
6. Launch a PowerShell from  Windows Terminal and execute the following command:

    ```powershell title="From Windows Powershell"
    # if run in Windows command line (DOS), replace $env:USERPROFILE with %USERPROFILE%
    pageant.exe --openssh-config $env:USERPROFILE\.ssh\pageant.conf $env:USERPROFILE\.ssh\id_ed25519.ppk
    ```

    Note: Adjust the path to your PPK file if it's stored in a different location.

    Upon successful execution, the Pageant icon will appear in your system tray. If you can't see the icon, you may need to configure Windows to show all system tray icons - follow this [guide](https://www.geeksforgeeks.org/show-all-icons-in-system-tray-on-windows/) for instructions. To verify that your key is properly loaded, right-click the Pageant icon and select *View Keys* - you should see `id_ed25519.ppk` listed.

7. Edit your SSH config file located at `%USERPROFILE%\.ssh\config` (or `$env:USERPROFILE\.ssh\config` in Powershell). Insert `include "pageant.conf"` as the first line. If you have any `IdentityFile your_private_ssh_file_path` lines in your config, remove them since Pageant will now manage your SSH keys.

    ```conf title="A simple example for %USERPROFILE%\.ssh\config"
    include "pageant.conf"

    Host *
        User your_username

        # Specifies whether the connection to the authentication agent will be
        # forwarded to the remote machine.
        ForwardAgent yes
    ```

8. Open VSCode, click *View* -> *Command Palette* -> *Remote-SSH: Connect to Host*, and enter `user@hostname`. You should now be able to connect to your remote SSH machine.
9. To have Pageant start automatically when Windows boots, add it to your Startup folder. Press `Win+R`, type `shell:startup` to open the Startup folder for your current user. Create a new shortcut by right-clicking and selecting *New* -> *Shortcut*. In the location field, enter `pageant.exe --openssh-config %USERPROFILE%\.ssh\pageant.conf %USERPROFILE%\.ssh\id_ed25519.ppk` (you may need to specify the full path to `pageant.exe`). Give the shortcut a name and click Finish.
