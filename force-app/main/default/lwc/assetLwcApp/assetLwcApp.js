import { LightningElement, track } from 'lwc';

export default class AssetLwcApp extends LightningElement {
    @track languageId = '';
    @track topicId = '';
    @track appOption = 'viewAssetCode';
    @track viewAssetCode = true;
    @track viewAssetProject = false;

     get appOptions() {
         return [{
                 label: 'Asset Code',
                 value: 'viewAssetCode'
             },
             {
                 label: 'Asset Project',
                 value: 'viewAssetProject'
             },
             // {
             //     label: 'New',
             //     value: 'newTopic'
             // },
         ];
     }

    handleAppOptionChange(event) {
        this.appOption = event.target.value;

        switch (this.appOption) {
            case 'viewAssetCode':
                this.viewAssetCode = true;
                this.viewAssetProject = false;
                break;
            default:
                this.viewAssetCode = false;
                this.viewAssetProject = true;
                
        }
    }

    handleSelectLanguage(event){
        this.languageId = event.detail;
    }
    handleSelectTopic(event) {
        this.topicId = event.detail;
    }

    handleChangeTopicTitle(){
        this.template.querySelector('c-asset-topic-list').refreshTopicsCache();
    }

    handleDeleteTopic() {
        this.template.querySelector('c-asset-topic-list').refreshTopicsCache();
    }

}