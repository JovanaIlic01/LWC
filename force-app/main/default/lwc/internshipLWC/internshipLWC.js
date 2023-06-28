import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createCase from '@salesforce/apex/CaseController.createCase';
import getRooms from '@salesforce/apex/CaseController.getRooms';
import getContacts from '@salesforce/apex/CaseController.getContacts';
import getRepairMen from '@salesforce/apex/CaseController.getRepairMen';
import internshipStyles from './internshipLWC.css'

export default class CreateCaseForm extends NavigationMixin(LightningElement) {
    static stylesheets=[internshipStyles];
    @track roomNumber = '';
    @track repairTypeValue = '';
    @track failureConditionValue='';
    @track malfunctionSubject = '';
    @track description = '';
    @track selectedContactId = '';
    @track optionsArray = [];
    @track contactOptions = [];
    @track showTable = false;
    @track contacts = [];
    @track testValue='';
    @track imageUrl='';





    connectedCallback() { 
        getRooms().then((result) => {
              let arr = [];
            for (var i = 0; i < result.length; i++) {
                arr.push({ label: result[i].Name, value: result[i].Id });
            }
            this.optionsArray = arr;
        });
        getContacts().then((result) => {
            let contactArr = [];
            for (var i = 0; i < result.length; i++) {
                contactArr.push({ label: result[i].LastName, value: result[i].Id });
            }
            this.contactOptions = contactArr;
        });
    }

    get options() {
        return this.optionsArray;
    }

    get repairOptions() {
        return [
            { label: 'Internet', value: 'Internet' },
            { label: 'Electricity', value: 'Electricity' },
            { label: 'Water', value: 'Water' },
            { label: 'Heating', value: 'Heating' }
        ];
    }


    get conditionOptions() {
        return [
            { label: 'Minor Failure', value: 'Minor Failure' },
            { label: 'Serious Failure', value: 'Serious Failure' },
            { label: 'Urgen Repair Failure', value: 'Urgen Repair Failure'},       
        ];
    }



    handlefailureConditionChange(event){
    this.failureConditionValue=event.target.value;
    }

    handleRoomNumberChange(event) {
    this.roomNumber = event.target.value;
    }

    handleRepairTypeChange(event) {
    this.repairTypeValue = event.detail.value;
    this.getRepairMen(this.repairTypeValue);
     }
  
    handleMalfunctionSubjectChange(event) {
        this.malfunctionSubject = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }
        handleContactChange(event) {
        this.selectedContactId = event.target.value;
    }

   
    getRepairMen(repairType) {
        getRepairMen({ repairType: this.repairTypeValue })
          .then((result) => {
            
        this.contacts = result;

        this.showTable = true;             
        this.imageUrl=this.getImageUrl(this.contacts[0].Review__c);// ne znam kako da mu posaljem ovo jer je lista joojjjjj!!!
        })
          .catch((error) => {         
            console.error(error);
        });
      }

   //ide preko case-a jer ne moze preko formula polja sa static resource-ima :/
   //radi mi ovo ali ne znam kako da ga pokupim 
     getImageUrl(review) {
        switch (review) {
        case 1:
            return '/img/samples/stars_100.gif';
        case 2:
            return '/img/samples/stars_200.gif';
        case 3:
            return '/img/samples/stars_300.gif';
        case 4:
            return '/img/samples/stars_400.gif';
        case 5:
            return '/img/samples/stars_500.gif';
        default:
            return 'https://freepngimg.com/thumb/categories/1845.png';
    }
}



    createCase() {
        createCase({
            roomNumber: this.roomNumber,
            repairType: this.repairTypeValue,
            malfunctionSubject: this.malfunctionSubject,
            description: this.description,
            contactId: this.selectedContactId,
            failureCondition:this.failureConditionValue
        })
            .then((caseId) => {
                console.log('Case created successfully with ID:', caseId);
                this.resetForm();            
                this.navigateToNewCase(caseId);
                const event = new ShowToastEvent({
                    title: 'CASE CREATED SUCCESSFULLY!',
                    message: 'The newly created record is shown on this page.',
                    variant: 'success',
                });
            this.dispatchEvent(event);           
            })
            .catch((error) => {
                console.error('Error creating case', error);
                const event = new ShowToastEvent({
                    title: 'Can not save Case Record.',
                    message: 'ALL fields are required!',
                    variant: 'failure',
                });
                this.dispatchEvent(event);
            });

    }




    resetForm() {
        this.roomNumber = '';
        this.repairTypeValue = '';
        this.malfunctionSubject = '';
        this.description = '';
        this.selectedContactId = '';
        this.failureConditionValue=null;    }




    navigateToNewCase(caseId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }
}