import {
    LightningElement,
    api,
    track
} from 'lwc';
import {
    updateRecord, deleteRecord
} from 'lightning/uiRecordApi';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Project_Topic__c.Id';
import SELECTED_FIELD from '@salesforce/schema/Project_Topic__c.Selected__c';

export default class AssetProjectTopicDescriptionList extends LightningElement {
    @api projectTopic = {};
    @track selected = false;
    @track error;

    get description() {
        if (this.projectTopic.Topic__c) {
            return this.projectTopic.Topic__r.Description__c;
        }
        return '';
    }

    get title() {
        if (this.projectTopic.Topic__c) {
            return this.projectTopic.Topic__r.Title__c;
        }
        return '';
    }

    handleSelectedClick(event) {
        this.selected = event.target.checked;
        this.updateProjectTopic();
    }

    updateProjectTopic() {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.projectTopic.Id;
        fields[SELECTED_FIELD.fieldApiName] = this.selected;

        const recordInput = {
            fields
        };

        updateRecord(recordInput)
            .then(() => {
                const updateSelectedProjectTopicEvent = new CustomEvent('updateselected', {
                    detail: { projectTopicId: this.projectTopic.Id ,
                    selected: this.selected}
                });
                this.dispatchEvent(updateSelectedProjectTopicEvent);
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

    handleRemoveProjectTopicClick() {
        this.removeProjectTopic();
    }

    removeProjectTopic(){
        deleteRecord(this.projectTopic.Id)
            .then(() => {

                const deleteProjectTopicEvent = new CustomEvent('deleteprojecttopic', {
                    detail: 'deleted'
                });
                this.dispatchEvent(deleteProjectTopicEvent);
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
            });
    }

    renderedCallback() {
        const checkbox = this.template.querySelector('lightning-input');
        if (this.projectTopic.Selected__c) {
            checkbox.checked = this.projectTopic.Selected__c;
        } else {
            checkbox.checked = false;
        }
    }
}