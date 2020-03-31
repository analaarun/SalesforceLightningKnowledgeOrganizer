import {
    LightningElement,
    track,
    wire,
    api
} from 'lwc';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    getRecord,
    updateRecord
} from 'lightning/uiRecordApi';
import DESCRIPTION_FIELD from '@salesforce/schema/Topic__c.Description__c';
import ID_FIELD from '@salesforce/schema/Topic__c.Id';
import TITLE_FIELD from '@salesforce/schema/Topic__c.Title__c';

const FIELDS = ['Topic__c.Description__c', 'Topic__c.Title__c'];

export default class AssetTopicContent extends LightningElement {
    @api recordId;
    @track description;
    @track title;
    @track topicOption = 'viewTopic';
    @track viewTopic = true;
    @track editTopic = false;
    @track newTopic = false;

    get topicOptions() {
        return [{
                label: 'View',
                value: 'viewTopic'
            },
            {
                label: 'Edit',
                value: 'editTopic'
            },
            // {
            //     label: 'New',
            //     value: 'newTopic'
            // },
        ];
    }

    @wire(getRecord, {
        recordId: '$recordId',
        fields: FIELDS
    })
    wiredRecord({
        error,
        data
    }) {
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Topic',
                    message,
                    variant: 'error',
                }),
            );
        } else if (data) {
            this.description = data.fields.Description__c.value;
            this.title = data.fields.Title__c.value;
        }
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
        this.updateTopic(false);
    }

    handleTitleChange(event) {
        this.title = event.target.value;
        this.updateTopic(true);
        
    }

    updateTopic(isTitleUpdate) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[DESCRIPTION_FIELD.fieldApiName] = this.description;
        fields[TITLE_FIELD.fieldApiName] = this.title;

        const recordInput = {
            fields
        };

        updateRecord(recordInput)
            .then(() => {
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Success',
                //         message: 'Topic updated',
                //         variant: 'success'
                //     })
                // );
                if (isTitleUpdate)
                {
                    const changedTopicTitleEvent = new CustomEvent('changetopictitle', {
                        detail: this.title
                    });
                    this.dispatchEvent(changedTopicTitleEvent);
                }           
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });

    }

    handleTopicOptionChange(event) {
        this.topicOption = event.target.value;

        switch (this.topicOption) {
            case 'viewTopic':
                this.viewTopic = true;
                this.editTopic = false;
                this.newTopic = false;
                break;
            case 'editTopic':
                this.viewTopic = false;
                this.editTopic = true;
                this.newTopic = false;
                break;
            default:
                this.viewTopic = false;
                this.editTopic = false;
                this.newTopic = true;
        }
    }
}