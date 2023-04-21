import { Component, OnInit, ViewChild } from '@angular/core';
import { DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import { CommonCodeService } from 'src/app/shared/services/common-code.service';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { GridUtilService } from 'src/app/shared/services/grid-util.service';
import { Sacs040Service, Sacs040VO } from './sacs040.service';

@Component({
  selector: 'app-sacs040',
  templateUrl: './sacs040.component.html',
  styleUrls: ['./sacs040.component.scss']
})
export class Sacs040Component implements OnInit {

	@ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
    @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
    @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
    
    @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
    @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
    
    @ViewChild('popup', {static: false}) popup: DxPopupComponent;
    @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  
  
  // Global  
  G_TENANT: any;
  COLL_EXPT_CD: any;
  EXPT_CD: any;
  sessionUserId: any;
  
  // Form
  mainFormData = {};
  mainCount: any;
  
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = ['coll_expt_cd', 'expt_cd'];
  
  // combobox
  sbxColl_expt_cd = [];  
  sbxExpt_cd = [];  
  
  dsColl_expt_cd = [];
  dsExpt_cd = [];
  dsUser = [];
  // ***** popup ***** //
  popupMode = ' Add';
  // Form
  popupFormData: Sacs040VO;
  
  PAGE_PATH = '';
  
  constructor(public utilService: CommonUtilService,
  			  private service: Sacs040Service,
              private codeService: CommonCodeService,
  			  public gridUtil: GridUtilService,
  			  private bizService: BizCodeService) {
    this.sessionUserId = this.utilService.getUserUid();
	this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
	 this.G_TENANT = this.utilService.getTenant();
	 
	 this.initCode();   
	 
  }
  
  initCode(): void {
    
    
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
      this.sbxColl_expt_cd = result.data;
    });
    	
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
      this.sbxExpt_cd = result.data;
    });
    
    

  }
  
   // 화명 로딩 후 처리
  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    
    this.utilService.getGridHeight(this.mainGrid);
  }
  
  // 성공, 실패 안내문 호출
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }


// 조회 함수(수출사파트너사 정보)
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.mainList(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
        
        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      } else {
        return;
      }
    }
  }
  
  onReset(): void {
    this.mainForm.instance.resetValues();
    this.initData();
  }
  
  initData() : void {
	this.mainForm.instance.getEditor('sbxColl_expt_cd').focus();
}
  
  // 팝업 열기(수출사파트너사 정보)
  onPopupOpen(e): void {
    this.popup.visible = true;

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.saveBtn.visible = true;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.saveBtn.visible = false;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then()
    }
  }
  
  // 팝업 호출시 초기데이터(수출사파트너사 정보)
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, aaa: '', bbb: ''});
  }
  
   // 팝업 데이터 호출(수출사파트너사 정보)
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (result != null) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }
  
  // 팝업 호출 후 처리(수출사파트너사 정보)
  onPopupAfterOpen(): void {
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('coll_expt_cd').option('disabled', false);
      this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    } else {
	  this.popupForm.instance.getEditor('coll_expt_cd').option('disabled', true);
	  this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
	}
  }

  // 팝업 종류 후 처리
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
  }
  
  // 삭제 버튼 온클릭(수출사파트너사 정보)
  async onPopupDelete(): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      
      const result = await this.service.mainDelete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }
  
  
  
   // 저장 버튼 온클릭(수출사파트너사 정보)
  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      if (await this.execSave()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }
  
  // 데이터 저장(수출사파트너사 정보)
  async execSave(): Promise<boolean> {
    try {
      let result;
      let resultCount;
      
      resultCount = await this.service.mainCount(this.popupFormData);
      this.mainCount = resultCount.data;
      
      if(this.mainCount.count > 0 && this.popupMode === 'Add') {
		//const msg = this.utilService.convert1('sales.sentence1', '이미 등록된 정보입니다.', 'This is already registered information.');
        var msg = "이미 등록된 정보입니다.";
        if( this.utilService.getLanguage()!='ko' ) {
            msg = "This is already registered information.";
        }
        this.utilService.notify_error(msg);
        return;
	  }
	  
	  this.popupFormData["createdby"] = this.utilService.getUserUid();
	  this.popupFormData["modifiedby"] = this.utilService.getUserUid();

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      
      if (this.popupMode === 'Add') {
        result = await this.service.mainInsert(this.popupFormData);
      } 
      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        return true;
      } else {
        return false;
      }
    } catch {
      this.utilService.notify_error('There was an error!');
      return false;
    }
    return false;
  }
  
  
  // 팝업 닫기(수출사파트너사 정보)
  onPopupClose(): void {
    this.popup.visible = false;
  } 
  
  
  
  
  
  
  
  
}



