import { Component, OnInit, ViewChild } from '@angular/core';
import { DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import { CommonCodeService } from 'src/app/shared/services/common-code.service';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { GridUtilService } from 'src/app/shared/services/grid-util.service';
import { Sacs060Service, Sacs060VO } from './sacs060.service';

@Component({
  selector: 'app-sacs060',
  templateUrl: './sacs060.component.html',
  styleUrls: ['./sacs060.component.scss']
})
export class Sacs060Component implements OnInit {

  @ViewChild('mainForm', {static: false}) mainForm : DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid : DxDataGridComponent;
  @ViewChild('popup',    {static: false}) popup    : DxPopupComponent;
  @ViewChild('popupForm',{static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid',{static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('deleteBtn',{static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn',  {static: false}) saveBtn  : DxButtonComponent;

  dsYn     = []; // 사용여부
  dsWhCd   = []; // 창고코드
  dsPtrn   = []; // 파트너코드
  dsUser   = []; // 유저
  dsOrdGb  = []; // 주문구분
  dsCustGb = []; // 거래처구분
  // Global
  G_TENANT: any;
  sessionUserId: any;

  // Main
  mainFormData = {};
  mainCount    : any;
  mainGridDataSource : DataSource;
  mainEntityStore    : ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Sacs060VO;
  key = ['ptrn_cd','sales_wh_cd'];

  constructor( public utilService : CommonUtilService
             , public gridUtil    : GridUtilService
             , private codeService: CommonCodeService
             , private service    : Sacs060Service
             , private bizService : BizCodeService
             ) {
               this.sessionUserId = this.utilService.getUserUid(); 
               this.onPopupSave   = this.onPopupSave.bind(this);
               this.onPopupClose  = this.onPopupClose.bind(this);
               this.onPopupDelete = this.onPopupDelete.bind(this);
               
               this.onValueChangedCustGb = this.onValueChangedCustGb.bind(this);
               this.onValueChangedStdYn=this.onValueChangedStdYn.bind(this);
               
               this.onPwhChange=this.onPwhChange.bind(this);
               
             }

  ngOnInit(): void {
    this.dsOrdGb = [{cd: "1", nm: this.utilService.convert('sales.sale')},
                    {cd: "2", nm: this.utilService.convert('sales.rent')},
                    {cd: "3", nm: this.utilService.convert('sales.ord_sample')}];
    
    this.dsCustGb = [{cd:"2", nm: this.utilService.convert('sales.expt_cd')}
                    ,{cd:"4", nm: this.utilService.convert('sales.impt_cd')}
                    ,{cd:"3", nm: this.utilService.convert('sales.ptrn_cd')}]
    
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });
    
    // 작업상태
    this.dsYn = [{cd:"Y", nm:"Y"}, {cd:"N", nm:"N"}];
    //창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {this.dsWhCd = result.data;});

    //파트너
    this.bizService.getCust(this.G_TENANT, '', '', '', '', '', '').subscribe(result => {this.dsPtrn = result.data;});

    //사용여부
    //this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {this.dsYn = result.data;});
    
 

  }
  
    ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    
    this.utilService.getGridHeight(this.mainGrid);
  }
  
  /** main stage **/
  // main grid search
  async onSearch(): Promise<void> {
  
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.list(this.mainFormData);
      console.log(result);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
        
        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // main grid reset
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  /** popup stage **/
  // popup close validation
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
  }

  // popup open validation
  onPopupAfterOpen(): void {
    this.popupForm.instance.getEditor('std_yn').option('disabled', true);
    this.popupForm.instance.getEditor('sales_wh_cd').option('disabled', true);
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
      this.popupForm.instance.getEditor('cust_gb').option('disabled', false);
    } else {
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
      this.popupForm.instance.getEditor('cust_gb').option('disabled', true);
    }
  }

  // popup open
  onPopupOpen(e): void {
    this.popup.visible = true;
    this.deleteBtn.visible = true;
    this.saveBtn.visible = true;

    if (e.element.id === 'Add') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
    } else {
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then();
    }

    this.popupVisible = true;
  }

  // Popup Close
  onPopupClose(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // Save OnClick Event
  async onPopupSave(e): Promise<void>{
    const popData = this.popupForm.instance.validate();

    if(popData.isValid) {
      let result;
      let countSales;
      let countStd;

      const saveContent = this.popupFormData as Sacs060VO;

      console.log(saveContent);

      
      if(this.popupMode === 'Add'){// New
        if(this.popupFormData.cust_gb == '3'){
          // 표준 duplication check
          if(this.popupFormData.pwh_cd != ''){
            countStd = await this.service.std_dup_check(JSON.stringify(saveContent));
            if(countStd.data[0].count > 0 && countStd.data[0].std_yn == 'Y') {
              this.utilService.notify_error(this.utilService.convert('중복됩니다.'));
              return;
            }
          }
        } else {
          countSales = await this.service.sales_dup_check(JSON.stringify(saveContent));
          if(countSales.data[0].count > 0){
            this.utilService.notify_error(this.utilService.convert('중복됩니다.'));
            return;
          }
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        result = await this.service.insert(JSON.stringify(saveContent));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        this.popupFormData["createdby"]  = this.sessionUserId;
        this.popupFormData["modifiedby"] = this.sessionUserId;

        if (!result.success || result.count > 0) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popup.visible = false;
          this.onSearch();
        }
      } else {// Edit
        result = await this.service.update(JSON.stringify(saveContent));
        if (!result.success || result.count > 0) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popup.visible = false;
          this.onSearch();
        }
      }
    }
  }

  // popup delete event
  async onPopupDelete(e): Promise<void>{
    try{
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
       }

       const deleteContent = this.popupFormData as Sacs060VO;
       const result = await this.service.delete(deleteContent);

        if (result.success) {
          this.utilService.notify_success('Delete success')
          this.popupForm.instance.resetValues();
          this.popup.visible = false;
          this.onSearch();
        }
    }catch{
      this.utilService.notify_error('There was an error');
    }
  }
  // popup search
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.info(data);

    if (result != null) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }
  
  onValueChangedCustGb(e): void{
    console.log("==== onValueChangedCustGb ====");
    this.popupForm.instance.getEditor('std_yn').option('disabled', true);
    if(!e.event){
      return;
    }

    if(e.value == 2){
      console.log("=== onValueChangedCustGb 2 ===");
      this.popupFormData.std_yn = 'N';
      this.popupFormData.pwh_cd = '';
      this.popupForm.instance.getEditor('pwh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('std_yn').option('disabled', true);
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => {this.dsPtrn = result.data;});
    }
    
    if(e.value == 3){
      console.log("=== onValueChangedCustGb 3 ===");
      this.popupFormData.std_yn = 'Y';
      this.popupForm.instance.getEditor('pwh_cd').option('disabled', false);
      //this.popupForm.instance.getEditor('std_yn').option('disabled', true);
      this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => {this.dsPtrn = result.data;});
    }
    
    if(e.value == 4){
      console.log("=== onValueChangedCustGb 4 ===");      
      this.popupFormData.std_yn = 'N';
      this.popupFormData.pwh_cd = '';
      this.popupForm.instance.getEditor('pwh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('std_yn').option('disabled', true);
      this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => {this.dsPtrn = result.data;});
    }
  }

  onPwhChange(e): void {
    console.log("=== onPwhChange ===");
    if(!e.event){
      return;
    }
    
    if(e.value != '' ){
      this.popupForm.instance.getEditor('std_yn').option('disabled', false);
      this.popupFormData.std_yn = '';
    } 
  }
  
  onValueChangedStdYn(e): void {
    console.log("=== onValueChangedStdYn ===");
    if(!e.event){
      return;
    }
    if(this.popupFormData.pwh_cd == '' || this.popupFormData.pwh_cd == null){
      this.popupFormData.std_yn = 'N';
      this.popupForm.instance.getEditor('std_yn').option('disabled', true);
    }
  }

}
