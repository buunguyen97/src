import { Component, OnInit, ViewChild } from '@angular/core';
import { DxButtonComponent, DxDataGridComponent, DxFormComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import { CommonCodeService } from 'src/app/shared/services/common-code.service';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { GridUtilService } from 'src/app/shared/services/grid-util.service';
import { Saor210Service, Saor210VO } from './saor210.service';

@Component({
  selector: 'app-saor210',
  templateUrl: './saor210.component.html',
  styleUrls: ['./saor210.component.scss']
})
export class Saor210Component implements OnInit {

  constructor(
    public utilService: CommonUtilService,
    public gridUtil: GridUtilService,
    private service: Saor210Service,
    private codeService: CommonCodeService,
    private bizService: BizCodeService
  )
  {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    
    this.popupSaveClick2 = this.popupSaveClick2.bind(this);
    this.popupCancelClick2 = this.popupCancelClick2.bind(this);
    this.onPopup2 = this.onPopup2.bind(this);
    
    this.onSelectionChangedExptCd = this.onSelectionChangedExptCd.bind(this);
    this.onSelectionChangedPtrn = this.onSelectionChangedPtrn.bind(this);
    this.onSelectionChangedOrdNo = this.onSelectionChangedOrdNo.bind(this);
    this.onSelectionChangedOutNo = this.onSelectionChangedOutNo.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.setOrdPr = this.setOrdPr.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.outStatNm = this.outStatNm.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupGrid2', {static: false}) popupGrid2: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('subForm', {static: false}) subForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsMainPtrnCd = []; // 수출사-파트너사
  dsPtrnCd     = []; // 수출사-파트너사
  dsCopyPtrnCd = []; // 수출사-파트너사
  dsMonyUnit   = []; // 화폐
  dsOutStat    = []; // 주문단계
  dsItemCd     = []; // 품목
  dsUser       = []; // 사용자
  dsSaWh       = []; // 영업창고
  dsCopySaWh   = []; // 수출사 - 영업창고
  dsRfr        = []; // 반품사유
  dsCountry    = []; // 국가
  dsCopyOutNo  = []; // 출고번호1
  dsOutNo      = []; // 출고번호2
  dsCopyOrdNo  = []; // 주문번호1
  dsOrdNo      = []; // 주문번호2
  dsCountry2   = []; // 국가2
  dsWrkStat    = []; // 작업상태
  dsOrdData    = []; // 계약정보
  dsOutData    = []; // 출고일자

  dsExptCdAll  = []; // 전체수출사
  dsPtrnCdAll  = []; // 전체파트너사

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saor210VO = {} as Saor210VO;

  // main grid
    dsMainGrid: DataSource;
    entityStoreMainGrid: ArrayStore;
  
  // Popup
  popupVisible = false;
  popupVisible2 = false;
  popupMode = 'Add';
  popupFormData: Saor210VO;
  popupFormData2: Saor210VO;
  subFormData: Saor210VO;
  firstPopupData = "";

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;
    
  // popup detail grid2
  dsOrdGrid: DataSource;
  entityStoreOrdGrid: ArrayStore;
  
  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key  = 'uid';
  key2 = 'item_cd';
  key3 = 'ord_no';

  // Grid State
  GRID_STATE_KEY = 'saor_saor200_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  ngOnInit(): void {
    // 작업상태
    this.dsWrkStat = [{cd:"0", nm:this.utilService.convert('sales.rc_reg')},
                      {cd:"1", nm:this.utilService.convert('sales.rc_receive')}];
                      
    // 반품사유
    this.dsRfr = [{cd:"0", nm:this.utilService.convert('sales.rfr_none')},
                  {cd:"1", nm:this.utilService.convert('sales.rfr_pd')},
                  {cd:"2", nm:this.utilService.convert('sales.rfr_simple_chage')},
                  {cd:"3", nm:this.utilService.convert('sales.rfr_item_reord')}
                 ];

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => { this.dsExptCd = result.data; });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => { this.dsMainPtrnCd = result.data; });

    // 수출사 - 파트너사
    this.bizService.getExptPtrn(this.G_TENANT).subscribe(result => { this.dsCopyPtrnCd = result.data; });

    // 거래처 - 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => { this.dsCopySaWh = result.data; });
    
    // 거래처 - 주문번호
    //this.bizService.getOrdNo(this.G_TENANT).subscribe(result => { this.dsCopyOrdNo = result.data; });
    
    // 거래처 + 주문번호 - 출고번호
    //this.bizService.getOutNo(this.G_TENANT).subscribe(result => { this.dsCopyOutNo = result.data; });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => { this.dsMonyUnit = result.data; });
    
    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => { this.dsCountry = result.data; });
    
    // 전체 품목
    this.bizService.getItem(this.G_TENANT,'','Y','1','','').subscribe(result => { this.dsItemCd = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });
    
    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => { this.dsExptCdAll = result.data; });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => { this.dsPtrnCdAll = result.data; });
  }

  ngAfterViewInit(): void{
        // 팝업 그리드 초기화
    this.entityStoreItemGrid = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.dsItemGrid = new DataSource({
      store: this.entityStoreItemGrid
    });

    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {

    // 공통 조회 조건 set
    //this.mainForm.instance.getEditor('fromOrdDate').option('value', this.gridUtil.getToday());
    //this.mainForm.instance.getEditor('toOrdDate').option('value', this.gridUtil.getToday());
    if( this.userGroup == "2" ) {
      this.mainForm.instance.getEditor('exptCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('exptCd').option('disabled', true);
    }
  }

  /**
   *  초기화 메소드 END
   */

  /**
   *  조회 메소드 START
   */
  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dsMainGrid = new DataSource({
          store: this.entityStoreMainGrid
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
        
        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
      // Service의 get 함수 생성
      console.log("this.popupFormData");
      console.log(this.popupFormData);
      const result = await this.service.detailList(this.popupFormData);
      
      // 수출사계약 품목 목록 조회.
      this.bizService.exptContItemList(this.G_TENANT,this.popupFormData.cont_no).subscribe(result => { this.dsItemCd = result.data; });
    
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }
      else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        
        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.ordItemList,
            key: this.key
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
        // this.popupGrid.paging.pageIndex = 0;
      }
  }
  
  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {out_stat:"0", ...e.data});
  }
  
  async onPopup2(e): Promise<void> {
    console.log({...e.data});
    this.showPopup2({...e.data});
  };

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {

      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();
    
    if (popData.isValid) {
      try {
        let result;
    
        let lastPopupData: string = JSON.stringify(this.popupFormData);
        let formModified: string = "N";
        
        console.log(this.firstPopupData);
        console.log(lastPopupData);
        
        if( this.firstPopupData != lastPopupData ) {
            formModified = "Y";
            console.log('diff');
        }
        else {
            console.log('same');
        }
        
        let bpDt: string = this.popupForm.instance.getEditor('bp_dt').option('value').replace(/-/gi,"");
        
        const saveContent = this.popupFormData as Saor210VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
        
        for( const items of detailList ) {
          if (items.operType != "remove") {
            if (items.ord_qty <= 0) {
              var msg = "주문수량을 1개 이상 입력하세요.";
              if( this.utilService.getLanguage()!='ko' ) {
                msg = "Enter at least 1 order quantity.";
              }
              this.utilService.notify_error(msg);
              return;
            }
              if (items.ord_pr <= 0) {
                // const msg = this.utilService.convert1('gt_expectQty', '입고예정수량을 1개 이상 입력하세요.');
                var msg = "주문단가를 입력하세요.";
                if( this.utilService.getLanguage()!='ko' ) {
                    msg = "Enter order unit price.";
                }
                this.utilService.notify_error(msg);
                return;
              }
          }
        }
        
        var indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid,"item_cd");
        if( indexWhenDup > -1 ) {
          var msg = "품목이 중복됩니다.";
          if( this.utilService.getLanguage()!='ko' ) {
              msg = "Duplicate item(s).";
          }
          this.utilService.notify_error(msg);
          return;
        }

        if( formModified=="N" && !this.popupGrid.instance.hasEditData() ) {
          var msg = "변경항목이 없습니다.";
          if( this.utilService.getLanguage()!='ko' ) {
              msg = "There are no changes.";
          }
          this.utilService.notify_error(msg);
          return;
        }
        
        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }
        
        saveContent.ordItemList = detailList;
        
        saveContent["createdby"]    = this.sessionUserId;
        saveContent["modifiedby"]   = this.sessionUserId;
        saveContent["formModified"] = formModified;
        saveContent["language"]     = this.utilService.getLanguage();
        
        console.log(saveContent);
        console.log(this.popupMode);

        if(this.popupMode === 'Add'){
          console.log(' -- popupmode add start -- ')
          result = await this.service.mainInsert(saveContent);
        } else if(this.popupMode === 'Edit'){
          console.log(' -- popupmode edit start -- ')
          result = await this.service.mainSave(saveContent);
        }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        }
        else {
          this.utilService.notify_success('Save success');
          //this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  
  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }
  
  // row별 Edit 제어
  onEditorPreparing(e, grid): void {
    if (e.dataField === "item_cd" && e.parentType === "dataRow") {
        e.editorOptions.disabled = e.row.data.uid ? true:false;
    }
  }

  // 계약사 - 계약번호
  suspendValueChagned = false;
  onSelectionChangedExptCd(e): void {
    console.log("====onSelectionChangedExptCd======");
    if(e.value == undefined){
      e = this.popupFormData.expt_cd;
    }
    if( this.suspendValueChagned ) {
        this.suspendValueChagned = false;
        return;
    }
    if( !e ) return;
    //if( !e.event ) return;
    
    this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === (e ? e.value : this.popupFormData.expt_cd));

    // 수출사 - 계약정보
    if( e ) {
      console.log(e)
      if( e.value == undefined){
        this.bizService.getOrdNoB(this.G_TENANT, this.popupFormData.expt_cd).subscribe(result => {
          this.dsOrdNo = result.data;
        });
        /*this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
          this.dsSaWh = result.data;
        })*/
      }
      if( e.value ) {
        // 주문번호
        this.bizService.getOrdNoB(this.G_TENANT, this.popupFormData.expt_cd).subscribe(result => {
          this.dsOrdNo = result.data;
        });
         /*this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
           this.dsSaWh = result.data;
         });*/
      }
    }
  }
  
    // 계약사 - 계약번호
  onSelectionChangedOrdNo(e): void {
    console.log("====onSelectionChangedOrdNo======");
    
    if(e.value == undefined){
      e = this.popupFormData.ord_no;
    }

    if( this.suspendValueChagned ) {
        this.suspendValueChagned = false;
        return;
    }
    if( !e ) return;
    //if( !e.event ) return;

    // 수출사 - 계약정보
    if( e ) {
      if(e.value == undefined){
        this.bizService.getOutNo(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsOutNo = result.data;
        });
        // 납품국가 
        this.bizService.getCountry(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsCountry2 = result.data;
          console.log(result.data);
          console.log(result.data[0].cd);
          this.popupFormData.dg_country = result.data[0].cd;
          this.popupFormData.dg_adr1 = result.data[0].dg_adr1;
        });
        // 거래내용
        this.bizService.getOrdDtData(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsOrdData = result.data;
          console.log(result.data);
          console.log(result.data[0]);
          this.popupFormData.ord_dt  = result.data[0].ord_dt
          this.popupFormData.rent_end_dt  = result.data[0].rent_end_dt
          this.popupFormData.rent_st_dt  = result.data[0].rent_st_dt
          
        });
        
      }
      if( e.value != undefined ) {
        this.bizService.getOutNo(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsOutNo = result.data;
        });
        // 납품국가 
        this.bizService.getCountry(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsCountry2 = result.data;
          console.log(result.data);
          console.log(result.data[0].cd);
          this.popupFormData.dg_country = result.data[0].cd;
          this.popupFormData.dg_adr1 = result.data[0].dg_adr1;
        });
        
        // 거래내용
        this.bizService.getOrdDtData(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
          this.dsOrdData = result.data;
          console.log(result.data);
          console.log(result.data[0]);
          this.popupFormData.ord_dt  = result.data[0].ord_dt
          this.popupFormData.rent_end_dt  = result.data[0].rent_end_dt
          this.popupFormData.rent_st_dt  = result.data[0].rent_st_dt
          
        });
        
        this.onItemSearch(this.popupFormData.ord_no);
      }
    }
  }
  
  // 계약사 - 계약번호
  onSelectionChangedOutNo(e): void {
    console.log("====onSelectionChangedOutNo======");
    
    if(e.value == undefined){
      e = this.popupFormData.out_ord_no;
    }

    if( this.suspendValueChagned ) {
        this.suspendValueChagned = false;
        return;
    }
    if( !e ) return;
    //if( !e.event ) return;

    // 수출사 - 계약정보
    if( e ) {
      if( e.value ) {
        this.bizService.getOutDtData(this.G_TENANT, this.popupFormData.out_ord_no).subscribe(result => {
          this.dsOutData = result.data;
          console.log(result.data[0]);
          this.popupFormData.out_ord_dt = result.data[0].out_ord_dt
        });
      }
      if(e.value == undefined){
        this.bizService.getOutDtData(this.G_TENANT, this.popupFormData.out_ord_no).subscribe(result => {
          this.dsOutData = result.data;
          console.log(result.data[0]);
          this.popupFormData.out_ord_dt = result.data[0].out_ord_dt
        });
      }
    }
  }

  // 파트너사 - 창고
  onSelectionChangedPtrn(e): void {
    console.log("====onSelectionChangedPtrn====");
    
    if(e.value == undefined){
      e = this.popupFormData.ptrn_cd;
    }

    if( this.suspendValueChagned ) {
        this.suspendValueChagned = false;
        return;
    }
    if( !e ) return;
    //if( !e.event ) return;

    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));

    // 수출사 - 계약정보
    if( e ) {
      if( e.value ) {

         this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
           this.dsSaWh = result.data;
         });

      }
    }
  }
  
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  /**
   *  이벤트 메소드 END
   */

  /**
   *  팝업 메소드 START
   */
  showPopup(popupMode, data): void {
    
    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }
    
    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.firstPopupData = JSON.stringify(this.popupFormData);
    this.popupMode = popupMode;
    
    // 팝업 버튼 보이기 정리
    if (this.popupMode === 'Add') { // 주문할당
      this.deleteBtn.visible = false; // 삭제버튼
      this.saveBtn.visible   = true; // 저장버튼
    }
    else {
      if( this.popupFormData.out_stat == "0" ) {
        this.deleteBtn.visible = true;
        this.saveBtn.visible = true;
      }
      else {
        this.deleteBtn.visible = true;
        this.saveBtn.visible = true;
      }
    }
    
    this.popupVisible = true;
    
    if (this.popupMode === 'Add' && this.popupForm ) {
      this.popupForm.instance.resetValues();
    }
    
    this.onSearchPopup();
  }
  
  showPopup2(data): void {
    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }
    
    this.popupFormData2 = data;
    this.popupFormData2 = {tenant: this.G_TENANT, ...this.popupFormData2};
    this.popupVisible2 = true;
    
    this.onItemSearch2();
  }

  popupShown(e): void {
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);
    this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === this.popupFormData.expt_cd);
    
    this.popupForm.instance.getEditor('bp_dt').option('disabled', false);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false)
    this.popupForm.instance.getEditor('ord_no').option('disabled', false)
    this.popupForm.instance.getEditor('out_ord_no').option('disabled', false)
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', false)
    this.popupForm.instance.getEditor('dg_country').option('disabled', true);
    this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
    this.popupForm.instance.getEditor('dg_adr1').option('disabled', true);
    this.popupForm.instance.getEditor('out_ord_dt').option('disabled', true);
    this.popupForm.instance.getEditor('ord_dt').option('disabled', true);
    this.popupForm.instance.getEditor('rent_st_dt').option('disabled', true);
    this.popupForm.instance.getEditor('rent_end_dt').option('disabled', true);
    this.popupForm.instance.getEditor('invoice_qty').option('disabled', true);
    
    if (this.popupMode === 'Edit') { // 수정
      this.popupForm.instance.getEditor('bp_dt').option('disabled', true);
      this.popupForm.instance.getEditor('expt_cd').option('disabled', true)
      this.popupForm.instance.getEditor('ord_no').option('disabled', true)
      this.popupForm.instance.getEditor('out_ord_no').option('disabled', true)
      this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true)
      this.onSelectionChangedExptCd(this.popupFormData.expt_cd);
      this.onSelectionChangedPtrn(this.popupFormData.ptrn_cd);
      this.onSelectionChangedOrdNo(this.popupFormData.ord_no);
      this.onSelectionChangedOutNo(this.popupFormData.out_ord_no);
      this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);
      this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === this.popupFormData.expt_cd);
      if( this.popupFormData.out_stat == "1" ) {
        this.popupForm.instance.getEditor('remark').option('disabled', true);
      }
    } else {
      this.popupForm.instance.getEditor('bp_dt').option('value', this.gridUtil.getToday());
    }
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }
  
  // 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.item_cd = value;
    
    var result = await this.bizService.getOrdPr(this.G_TENANT,
                          this.popupFormData.cont_no,
                          value);
    rowData.ord_pr = result["ord_pr"];
  }
  
  setOrdPr(rowData: any, value: any): void {
    if( !this.isExptOk() ) {
      rowData.ord_pr = 0;
      return;
    }
    rowData.ord_pr = (value<0) ? 0:value;
  }
  
  isExptOk() {
    if( !this.popupFormData.ord_dt ) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord_dt', '주문일자', 'Order Date'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ord_dt').focus();
      return false;
    }
    if( !this.popupFormData.expt_cd ) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cust_cd', '거래처', 'Account'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
      return false;
    }
    if( !this.popupFormData.cont_no ) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cont_no', '계약번호', 'Contract No'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('cont_no').focus();
      return false;
    }
    return true;
  }
  
  // 주문금액 표현식
  calcOrdAmt(rowData) {
    return rowData.ord_qty * rowData.ord_pr;
  }
  // VAT 표현식
  calcOrdVatAmt(rowData) {
    return Math.ceil(rowData.ord_qty * rowData.ord_pr * 0.1);
  }
  
  // 작업상태 표현식
  outStatNm(rowData) {
    let nm:string  = "";
    if( this.utilService.getLanguage()=='ko' ) {
      if(   rowData.out_stat == "0" ) { nm = '반품등록'; }
      else                            { nm = '반품접수'; }
    }
    else {
      if(   rowData.out_stat == "0" ) { nm = 'Return Reg'; }
      else                            { nm = 'Return Receive'; }
    }
    return nm;
  }
  
  // grid edit 제어
  allowEditing(e) {
    return (this.popupFormData.out_stat=="1") ? false:true;
  }
  

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    // this.popupForm.instance.resetValues();
  }
  // 닫기클릭 이벤트

  popupCancelClick2(e): void {
    this.popupVisible2 = false;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
        
      const deleteContent = this.popupFormData as Saor210VO;
      const result = await this.service.mainDelete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        //this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 추가버튼 이벤트
  addClick(): void {
    if( !this.isExptOk() ) {
      return;
    }
    if( this.popupFormData.out_stat != "0" ) {  // 작업상태가 주문등록일때만 행추가 가능.
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.popupGrid.focusedRowIndex = rowIdx;
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if( this.popupFormData.out_stat != "1" ) {  // 작업상태가 주문등록일때만 행삭제 가능.
        
        const len = this.popupGrid.instance.getVisibleRows().length;
        if( len > 0 ) {
          let focusedIdx:number  = this.popupGrid.focusedRowIndex;
          if( focusedIdx < 0 ) {
            focusedIdx = this.popupGrid.instance.getVisibleRows().length-1;
            this.popupGrid.focusedRowIndex = focusedIdx;
          }
          
          this.popupGrid.instance.deleteRow(focusedIdx);
          this.entityStoreItemGrid.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
          
          // 삭제된 로우 위로 포커스
          this.popupGrid.focusedRowIndex = focusedIdx - 1;
        }
    }
  }

  // 팝업 데이터 호출(수출사파트너사 정보)
  async onItemSearch(data): Promise<void> {
    const result = await this.service.gridInfo(data);
    console.log(result.data);
    if (!result.success) {
      return;
    }else{
      
      this.popupGrid.instance.cancelEditData();
      
      this.entityStoreItemGrid = new ArrayStore({
        data: result.data,
        key: this.key2
      });
      this.dsItemGrid = new DataSource({
        store: this.entityStoreItemGrid
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

      var keys = this.popupGrid.instance.getSelectedRowKeys();
      this.popupGrid.instance.deselectRows(keys);
    }
  }
  
  // 팝업 데이터 호출(수출사파트너사 정보)
  async onItemSearch2(): Promise<void> {
    
    const result = await this.service.gridInfo2(this.popupFormData.expt_cd);
    if (!result.success) {
      return;
    }else{
      this.subFormData.exptCd2 = this.popupFormData.expt_cd;
      this.popupGrid2.instance.cancelEditData();
      
      this.entityStoreOrdGrid = new ArrayStore({
        data: result.data,
        key: this.key3
      });
      this.dsOrdGrid = new DataSource({
        store: this.entityStoreOrdGrid
      });
      this.popupGrid2.focusedRowKey = null;
      this.popupGrid2.paging.pageIndex = 0;

      var keys = this.popupGrid2.instance.getSelectedRowKeys();
      this.popupGrid2.instance.deselectRows(keys);
    }
  }
  
  // 팝업 데이터 호출(수출사파트너사 정보)
  async onItemSearch3(): Promise<void> {
    const result = await this.service.gridInfo2Search(this.subFormData);
    if (!result.success) {
      return;
    }else{
      this.subFormData.exptCd2 = this.popupFormData.expt_cd;
      this.popupGrid2.instance.cancelEditData();
      
      this.entityStoreOrdGrid = new ArrayStore({
        data: result.data,
        key: this.key3
      });
      this.dsOrdGrid = new DataSource({
        store: this.entityStoreOrdGrid
      });
      this.popupGrid2.focusedRowKey = null;
      this.popupGrid2.paging.pageIndex = 0;

      var keys = this.popupGrid2.instance.getSelectedRowKeys();
      this.popupGrid2.instance.deselectRows(keys);
    }
  }

  popupShown2(e): void {
    this.subForm.instance.getEditor('exptCd2').option('disabled', true);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }
  
  async popupSaveClick2(e): Promise<void> {
    let ordDatas: any = this.popupGrid2.instance.getSelectedRowsData();
    console.log(ordDatas[0]);
    this.popupFormData.ord_no = ordDatas[0].ord_no;
    this.popupFormData.out_ord_no = ordDatas[0].out_ord_no;
    this.popupVisible2 = false;

  }
  /**
   *  팝업 메소드 END
   */
}