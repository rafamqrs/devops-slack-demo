import { LightningElement, api, wire } from 'lwc';
import getChurnRisk from '@salesforce/apex/ChurnRiskController.getChurnRisk';

export default class ChurnRiskIndicator extends LightningElement {
    @api recordId;

    riskData;
    error;

    @wire(getChurnRisk, { opportunityId: '$recordId' })
    wiredRisk({ data, error }) {
        if (data) {
            this.riskData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.riskData = undefined;
        }
    }

    get hasData() {
        return !!this.riskData;
    }

    get riskLevel() {
        if (!this.riskData) return '';
        return this.riskData.riskLevel;
    }

    get riskScore() {
        if (!this.riskData) return 0;
        return this.riskData.riskScore;
    }

    get riskClass() {
        const level = this.riskLevel;
        if (level === 'High') return 'slds-theme_error';
        if (level === 'Medium') return 'slds-theme_warning';
        return 'slds-theme_success';
    }

    get recommendation() {
        if (!this.riskData) return '';
        return this.riskData.recommendation;
    }
}
