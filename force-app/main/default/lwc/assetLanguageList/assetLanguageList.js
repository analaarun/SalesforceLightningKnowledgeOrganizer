import {
    LightningElement,
    wire,
    track
} from 'lwc';
import {
    refreshApex
} from '@salesforce/apex';

import getLanguages from '@salesforce/apex/AssetController.getLanguages';

export default class AssetLanguageList extends LightningElement {
    @track searchTerm = '';
    @track error;
    @track selectedLanguageId = '';
    @track languages = [];


     /** Wired Apex result so it can be refreshed programmatically */
     wiredLanguageResult;

    @wire(getLanguages, {
        searchLanguage: '$searchTerm'
    })
    loadLanguages(result) {
        this.wiredLanguageResult = result;
        if (result.data) {
            this.languages = result.data;
            this.error = undefined;
        } else if (result.error) {
            //handle error
            this.error = result.error;
            this.languages = undefined;
        }
    }

    handleRefreshLanguage(){
        return refreshApex(this.wiredLanguageResult);
    }

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
        console.log('The search Term');
        console.log(this.searchTerm);
    }

    handleClick(event) {
        this.selectedLanguageId = event.target.value;
        const allButtons = this.template.querySelectorAll('lightning-button');
        if (allButtons) {
            allButtons.forEach(button => {
                if (button.value == this.selectedLanguageId) {
                    button.variant = 'success';
                } else {
                    button.variant = 'brand-outline';
                }

            });
        }
        const selectedLanguageEvent = new CustomEvent('selectlanguage', {
            detail: this.selectedLanguageId
        });
        this.dispatchEvent(selectedLanguageEvent);
    }
}