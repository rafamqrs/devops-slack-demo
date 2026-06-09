public with sharing class SlackNotificationService {

    private static final String NAMED_CREDENTIAL = 'callout:Slack_Middleware';

    @InvocableMethod(label='Send Slack Message' description='Sends a message to Slack via middleware')
    public static List<SlackResult> sendMessage(List<SlackRequest> requests) {
        List<SlackResult> results = new List<SlackResult>();

        for (SlackRequest req : requests) {
            HttpRequest httpReq = new HttpRequest();
            httpReq.setEndpoint(NAMED_CREDENTIAL + '/webhook/github/pr');
            httpReq.setMethod('POST');
            httpReq.setHeader('Content-Type', 'application/json');

            Map<String, Object> payload = new Map<String, Object>{
                'channel' => req.channel,
                'message' => req.messageBody,
                'includeButtons' => req.includeButtons,
                'prNumber' => req.prNumber,
                'repo' => req.repoFullName
            };
            httpReq.setBody(JSON.serialize(payload));

            Http http = new Http();
            HttpResponse res = http.send(httpReq);

            SlackResult result = new SlackResult();
            result.success = (res.getStatusCode() == 200);
            result.responseMessage = result.success
                ? 'Mensagem enviada com sucesso para ' + req.channel
                : 'Erro ao enviar mensagem: HTTP ' + res.getStatusCode();
            results.add(result);
        }
        return results;
    }

    public class SlackRequest {
        @InvocableVariable(required=true label='Channel')
        public String channel;
        @InvocableVariable(required=true label='Message Body')
        public String messageBody;
        @InvocableVariable(label='Include Buttons')
        public Boolean includeButtons;
        @InvocableVariable(label='PR Number')
        public Integer prNumber;
        @InvocableVariable(label='Repository Full Name')
        public String repoFullName;
    }

    public class SlackResult {
        @InvocableVariable(label='Success')
        public Boolean success;
        @InvocableVariable(label='Response Message')
        public String responseMessage;
    }
}
