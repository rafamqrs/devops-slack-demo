public with sharing class ChurnRiskController {

    @AuraEnabled(cacheable=true)
    public static ChurnRiskResult getChurnRisk(Id opportunityId) {
        Opportunity opp = [
            SELECT Id, Amount, StageName, CloseDate, Probability,
                   Account.NumberOfEmployees, Account.AnnualRevenue
            FROM Opportunity
            WHERE Id = :opportunityId
            LIMIT 1
        ];

        Decimal score = calculateRiskScore(opp);
        String level = determineRiskLevel(score);
        String recommendation = buildRecommendation(level, opp);

        return new ChurnRiskResult(score, level, recommendation);
    }

    private static Decimal calculateRiskScore(Opportunity opp) {
        Decimal score = 0;

        if (opp.Probability != null && opp.Probability < 30) {
            score += 40;
        } else if (opp.Probability != null && opp.Probability < 60) {
            score += 20;
        }

        if (opp.CloseDate < Date.today()) {
            score += 30;
        } else if (opp.CloseDate < Date.today().addDays(7)) {
            score += 15;
        }

        if (opp.Amount != null && opp.Amount > 100000 && opp.StageName == 'Negotiation/Review') {
            score += 20;
        }

        if (opp.Account.AnnualRevenue != null && opp.Account.AnnualRevenue < 500000) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    private static String determineRiskLevel(Decimal score) {
        if (score >= 70) return 'High';
        if (score >= 40) return 'Medium';
        return 'Low';
    }

    private static String buildRecommendation(String level, Opportunity opp) {
        if (level == 'High') {
            return 'Ação urgente necessária. Agende uma reunião com o decisor antes de '
                + opp.CloseDate.format() + '. Considere oferecer condições diferenciadas.';
        }
        if (level == 'Medium') {
            return 'Atenção requerida. Reforce a proposta de valor e alinhe expectativas com o cliente.';
        }
        return 'Oportunidade saudável. Mantenha o acompanhamento regular e avance para próxima etapa.';
    }

    public class ChurnRiskResult {
        @AuraEnabled public Decimal riskScore;
        @AuraEnabled public String riskLevel;
        @AuraEnabled public String recommendation;

        public ChurnRiskResult(Decimal score, String level, String rec) {
            this.riskScore = score;
            this.riskLevel = level;
            this.recommendation = rec;
        }
    }
}
