import { LightningElement, track, api, wire } from 'lwc';
import getTopicsByLanguageId from '@salesforce/apex/AssetController.getTopicsByLanguageId';
import {
    refreshApex
} from '@salesforce/apex';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    createRecord
} from 'lightning/uiRecordApi';
import TOPIC_OBJECT from '@salesforce/schema/Topic__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Topic__c.Description__c';
import LANGUAGE_FIELD from '@salesforce/schema/Topic__c.Language__c';
import TITLE_FIELD from '@salesforce/schema/Topic__c.Title__c';

export default class AssetTopicList extends LightningElement {
    @api languageId = '';
    @track searchTerm = '';
    @track error;
    @track selectedTopicId = '';
    @track topics = [];
    @track topicOption = 'searchTopic';
    @track searchTopic = true;
    @track newTopic = false;
    @track newTopicName = '';

    get topicOptions() {
        return [{
                label: 'Search',
                value: 'searchTopic'
            },
            {
                label: 'New',
                value: 'newTopic'
            },
            {
                label: 'Refresh',
                value: 'refreshTopic'
            },
        ];
    }

    /** Wired Apex result so it can be refreshed programmatically */
    wiredTopicsResult;

    @wire(getTopicsByLanguageId, {
        languageId: '$languageId',
        searchTitle: '$searchTerm'
    })
    loadTopics(result) {
        this.wiredTopicsResult = result;
        if (result.data) {
            this.topics = result.data;
            this.error = undefined;
        } else if (result.error) {
            //handle error
            this.error = result.error;
            this.topics = undefined;
        }
    }

     @api refreshTopicsCache() {
        return refreshApex(this.wiredTopicsResult);
     }

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
    }

    handleClick(event) {
        this.selectedTopicId = event.target.value;
        const allButtons = this.template.querySelectorAll('lightning-button');
        if (allButtons) {
            allButtons.forEach(button => {
                if (button.value == this.selectedTopicId) {
                    button.variant = 'success';
                } else {
                    button.variant = 'brand-outline';
                }

            });
        }
        const selectedTopicEvent = new CustomEvent('selecttopic', {
            detail: this.selectedTopicId
        });
        this.dispatchEvent(selectedTopicEvent);
    }

    handleTopicOptionChange(event) {
        this.topicOption = event.target.value;

        switch (this.topicOption) {
            case 'searchTopic':
                this.searchTopic = true;
                this.newTopic = false;
                break;
            case 'newTopic':
                this.searchTopic = false;
                this.newTopic = true;
                break;
            default:
                return refreshApex(this.wiredTopicsResult);
        }
    }

    handleTopicNameChange(event){
        this.newTopicName = event.target.value;
    }

    handleSaveTopicClick(event){
        if ((this.languageId != '')
            && (this.newTopicName != ''))
        {
            this.createTopic();
        }
    }

    createTopic() {
        const fields = {};
        fields[DESCRIPTION_FIELD.fieldApiName] = this.newTopicName;
        fields[LANGUAGE_FIELD.fieldApiName] = this.languageId;
        fields[TITLE_FIELD.fieldApiName] = this.newTopicName;
        const recordInput = {
            apiName: TOPIC_OBJECT.objectApiName,
            fields
        };
        createRecord(recordInput)
            .then(topic => {
                this.selectedTopicId = topic.id;
                this.topicOption = 'searchTopic';
                this.newTopicName = '';
                // this.searchTerm = '';
                this.searchTopic = true;
                this.newTopic = false;
                const selectedTopicEvent = new CustomEvent('selecttopic', {
                    detail: this.selectedTopicId
                });
                this.dispatchEvent(selectedTopicEvent);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Topic created',
                        variant: 'success',
                    }),
                );
                return refreshApex(this.wiredTopicsResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }
}