---
authors:
- copdips
categories:
- email
comments: true
date:
  created: 2024-01-25
---

# Scripts to delete outlook emails

Outlook.com has an overwhelming number emails and deleting them using rules is challenging. Notably, the online filter of Outlook.com can only loads a maximum of 1000 emails. Therefor I have to use scripts (like VBA scripts) to delete them. Below is the script that selects all the unread emails before a given date and deletes them.

1. Connect to your Outlook.com account in MS Office outlook desktop client.
2. Go to account settings,locate the account name, open it, and set it to download all the emails for the past.
3. Press `Alt+F11` to open the VBA editor, and create a new module, and paste the following code into it.

    ```vba
    Sub DeleteUnreadEmailsFromSpecificAccount()
        Dim olApp As Outlook.Application
        Dim olSession As Outlook.NameSpace
        Dim olAccounts As Outlook.Accounts
        Dim olAccount As Outlook.Account
        Dim olFolder As Outlook.Folder
        Dim olItems As Outlook.Items
        Dim olItem As Object
        Dim cutoffDate As String
        Dim deletedCount As Long
        Dim filter As String
        Dim currentTime As String

        ' Initialize Outlook objects
        Set olApp = New Outlook.Application
        Set olSession = olApp.GetNamespace("MAPI")
        Set olAccounts = olApp.Session.Accounts

        ' Loop through accounts to find the specific one
        For Each olAccount In olAccounts
            If olAccount.SmtpAddress = "xiang.zhu@outlook.com" Then
                Set olFolder = olSession.Folders(olAccount.DeliveryStore.DisplayName).Folders("Inbox")
                Exit For
            End If
        Next

        ' Set olFolder = olSession.Folders("Personal Folders").Folders("Inbox")

        ' Check if the folder was set
        If olFolder Is Nothing Then
            MsgBox "Account not found.", vbExclamation
            Exit Sub
        End If


        ' Set the cutoff date and format it

        ' Define 3 filters for the items, all of them work, the last one will be used
        cutoffDate = Format("1/1/2023", "mm/dd/yyyy")
        filter = "[ReceivedTime] < '" & cutoffDate & "' AND [UnRead] = True"

        filter = "[ReceivedTime] <= '" & Format(Date - 400, "ddddd h:nn AMPM") & "' AND [UNREAD]=TRUE"


        filter = "@SQL=" & Chr(34) & "urn:schemas:httpmail:read" & _
                            Chr(34) & "=0 AND " & _
                            Chr(34) & "urn:schemas:httpmail:datereceived" & _
                            Chr(34) & "<='02/02/2023 00:00:00'"

        ' Apply the filter
        currentTime = Format(Now, "hh:mm:ss AM/PM")
        Debug.Print "==========" & currentTime

        Debug.Print "Total emails: " & olFolder.Items.Count
        Debug.Print filter
        Set olItems = olFolder.Items.Restrict(filter)
        Debug.Print "after filter items count: " & olItems.Count

        deletedCount = 0
        For Each olItem In olItems
                olItem.Delete
                deletedCount = deletedCount + 1
        Next olItem

    ' Debug code to check the emails
    '    For Each olItem In olItems
    '        Debug.Print "Subject: " & olItem.Subject & " | Received: " & olItem.ReceivedTime
    '    Next olItem

        ' Display the number of deleted emails
        Debug.Print deletedCount & " unread emails have been deleted."
    End Sub
    ```

4. Run the script, and it will delete all the unread emails before the cutoff date. If you immediately rerun the script, you might still see some emails to delete. This is because the deletion process from previous run is asynchronous, it takes some time to complete.
