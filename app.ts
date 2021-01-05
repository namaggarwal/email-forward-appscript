const settings = [
    {
        query: "label:Fool newer_than:2h",
        email: "fool-motley@googlegroups.com",
        property: "montley_fool_last_message"
    }
]

function getEmails(query: string): GoogleAppsScript.Gmail.GmailMessage[]{
    const threads = GmailApp.search(query);
    let messages: GoogleAppsScript.Gmail.GmailMessage[] = [];
    threads.forEach((thread) => {
        const threadMessages = thread.getMessages();
        messages = messages.concat(threadMessages);
    });
    messages.sort((m1,m2) => m2.getDate().getTime() - m1.getDate().getTime());
    return messages;
}


function getFilteredMessages(query:string, lastReadMessageID: string, userEmail: string):GoogleAppsScript.Gmail.GmailMessage[]{
    const emails = getEmails(query);
    const filteredEmails: GoogleAppsScript.Gmail.GmailMessage[] = [];
    for(const i in emails){
        if(emails[i].getId() === lastReadMessageID){
           break;
        }
        let mailFrom = emails[i].getFrom();
        mailFrom = mailFrom.indexOf("<") !== -1 ? mailFrom.substring(mailFrom.indexOf("<")+1,mailFrom.length-1):mailFrom;
        if(mailFrom === userEmail) {
            continue;
        }
        filteredEmails.push(emails[i]);
    }
    return filteredEmails;
}

function run() {
    const userEmail = Session.getEffectiveUser().getEmail();
    const scriptProperties = PropertiesService.getScriptProperties();
    settings.forEach(setting => {
        const lastReadMessageID = scriptProperties.getProperty(setting.property) || "";
        const emails = getFilteredMessages(setting.query, lastReadMessageID, userEmail);
        emails.forEach(email => {
            email.forward(setting.email);
        });
        emails.length > 0 && scriptProperties.setProperty(setting.property, emails[0].getId());
    })
}
