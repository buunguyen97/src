import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sasd040Service, Sasd040VO} from './sasd040.service';

@Component({
      selector: 'app-sasd040'
    , templateUrl: './sasd040.component.html'
    , styleUrls: ['./sasd040.component.scss']
})
export class Sasd040Component implements OnInit, AfterViewInit {

    constructor(
        public gridUtil: GridUtilService,
        public utilService: CommonUtilService,
        private service: Sasd040Service,
        private codeService: CommonCodeService,
        public bizService: BizCodeService) {
            this.G_TENANT = this.utilService.getTenant();
            this.sessionUid = this.utilService.getUserUid();
            this.popupSaveClick = this.popupSaveClick.bind(this);
            this.popupCancelClick = this.popupCancelClick.bind(this);
            this.popupDeleteClick = this.popupDeleteClick.bind(this);
            this.onChagedItemCd = this.onChagedItemCd.bind(this);
            this.popupHidden = this.popupHidden.bind(this);
        }

    @ViewChild('mainForm',  { static: false }) mainForm: DxFormComponent;
    @ViewChild('mainGrid',  { static: false }) mainGrid: DxDataGridComponent;
    @ViewChild('popupGrid', { static: false }) popupGrid: DxDataGridComponent;
    @ViewChild('popup',		{ static: false }) popup: DxPopupComponent;
    @ViewChild('popupForm', { static: false }) popupForm: DxFormComponent;
    @ViewChild('deleteBtn', { static: false }) deleteBtn: DxButtonComponent;

    // DataSet
    dsYN		= []; // 사용여부
    dsUser  	= []; // 사용자이름
    dsItemcode	= []; // 아이템코드
    dsItemcode2 = []; // 아이템코드2

    // Global
    G_TENANT: any;
    mainCount: any;
    sessionUid: any;
    countCheck: any;
    rowData: any;
    mainData: Sasd040VO = {} as Sasd040VO;

    // MainGrid
    dataSource: DataSource;
    entityStore: ArrayStore;

    // Popup
    popupFormData  = {};
    popupMode	   = 'Add';
    popupData: Sasd040VO;
    firstPopupData = '';

    // Popup Detail Grid
    popupDataSource: DataSource;
    popupEntityStore: ArrayStore;

    selectedRows: number[];
    deleteRowList = [];
    changes = [];
    key = 'item_cd';
    key2 = ['item_cd', 'm_item_cd'];

    // Grid State
    GRID_STATE_KEY = 'sasd_sasd040_1';
    saveStateMain  = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
    loadStateMain  = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
    saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
    loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

    ngOnInit(): void {
        // 사용여부
        this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => { this.dsYN = result.data; });
        // 품목
        this.bizService.getItem(this.G_TENANT, 'Y', 'Y', '', '', '')
          .subscribe(result => {

            this.dsItemcode = result.data.filter(el => {
                  // @ts-ignore
              return el.item_gb === '03' || el.item_gb === '05';
                });
          });

        // 모듈품목
        this.bizService.getItem(this.G_TENANT, 'N', 'Y', '', '', '').subscribe(result => { this.dsItemcode2 = result.data; });
        // 사용자
        this.codeService.getUser(this.G_TENANT).subscribe(result => {this.dsUser = result.data; });
    }

    ngAfterViewInit(): void {
        this.popupEntityStore = new ArrayStore({
            data: [], key: this.key
        });
        this.initForm();
        this.utilService.getGridHeight(this.mainGrid);
    }

    initForm() {}

    // 메인 그리드 조회
    async onSearch(): Promise<void> {
        const data = this.mainForm.instance.validate();
        if (data.isValid) {
            const result = await this.service.get(this.mainData);

            if (!result.success){
                this.utilService.notify_error(result.msg);
                return;
            } else {
                this.mainGrid.instance.cancelEditData();
                this.utilService.notify_success('search success');
                this.entityStore = new ArrayStore({
                    data: result.data,
                     key: this.key,
                });
                this.dataSource = new DataSource({
                    store: this.entityStore
                });
                this.mainGrid.focusedRowKey = null;
                this.mainGrid.paging.pageIndex = 0;
                const keys = this.mainGrid.instance.getSelectedRowKeys();
                this.mainGrid.instance.deselectRows(keys);
            }
        }
    }

    // 팝업 그리드 조회
    async onSearchPopup(): Promise<void> {
        if (this.popupData.item_cd) {
            // Service의 get 함수 생성
            const result = await this.service.mainInfo(this.popupData);
            if (!result.success) {
                this.utilService.notify_error(result.msg);
                return;
            } else {
                this.popupGrid.instance.cancelEditData();
                this.utilService.notify_success('search success');
                this.popupEntityStore = new ArrayStore({
                    data: result.data.sasd040DetailList,
                     key: 'm_item_cd'
                });
                this.popupDataSource = new DataSource({
                    store: this.popupEntityStore
                });
                this.popupGrid.focusedRowKey = null;
                this.popupGrid.paging.pageIndex = 0;
            }
        }
    }

    // 신규버튼 이벤트
    async onNew(e): Promise<void> {
        this.deleteBtn.visible = false;
        this.showPopup('Add', {...e.data});
    }

    // 팝업 저장
    async popupSaveClick(e): Promise<void> {
        const popupData = this.popupForm.instance.validate();
        if (popupData.isValid){
            try{

                let result;
                let count;

                const saveContent = this.popupData as Sasd040VO;
                const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

                saveContent.sasd040DetailList = detailList;
                saveContent.createdby  = this.sessionUid;
                saveContent.modifiedby = this.sessionUid;

                count = await this.service.itemCount(JSON.stringify(saveContent));
                if (detailList.length > 0){

                const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'm_item_cd');
                if ( indexWhenDup > -1 ) {
                    this.utilService.notify_error(this.utilService.convert('품목이 중복됩니다.'));
                    return;
                }



                for (const items of detailList){
                    if (items.operType !== 'remove') {
                        if (items.m_item_cd === ''){
                            this.utilService.notify_error(this.utilService.convert('모듈품목 선택은 필수입니다.'));
                            return;
                        }
                        if (items.c_qty < 1){
                            this.utilService.notify_error(this.utilService.convert('수량을 입력하세요.'));
                            return;
                        }
                    }
                }

                if (this.popupMode === 'Add' && count.data[0].count > 0){
                    this.utilService.notify_error(this.utilService.convert('이미 등록된 정보입니다.'));
                    return;
                }

                }   else if (detailList.length <= 0){

                    if (this.popupMode === 'Add'){
                        this.utilService.notify_error(this.utilService.convert('모듈품목 선택은 필수입니다.'));
                    } else {
                        this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
                    }
                    return;
                }

                const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
                if (!await this.utilService.confirm(confirmMsg)) {
                    return;
                }

                let sumKrw = 0;
                let sumUsd = 0;
                /**
                * 표준 소비자가격 입력 여부 / 합산 체크
                */
                for (const row of this.popupGrid.instance.getVisibleRows()) {
                  if ((row.data.sale_krw_pr !== 0 && !row.data.sale_krw_pr) || (row.data.sale_usd_pr !== 0 && !row.data.sale_usd_pr)) {
                    const errorMsg = this.utilService.convert1('requiredSalePrice', '표준소비자가를 입력하세요.');
                    this.utilService.notify_error(errorMsg);
                    return;
                  }
                  const saleKrwPr = Number((row.data.sale_krw_pr * row.data.c_qty).toFixed(4));
                  const saleUsdPr = Number((row.data.sale_usd_pr * row.data.c_qty).toFixed(4));

                  sumKrw = Number((sumKrw + saleKrwPr).toFixed(4));
                  sumUsd = Number((sumUsd + saleUsdPr).toFixed(4));
                }

                if (this.popupData.sale_krw_pr !== sumKrw || this.popupData.sale_usd_pr !== sumUsd) {
                  const errorMsg = this.utilService.convert1('notEqualSumPrice', '총 소비자가와 입력 소비자가가 일치하지 않습니다.');
                  this.utilService.notify_error(errorMsg);
                  return;
                }

                result = await this.service.mainInsert(JSON.stringify(saveContent));
                console.log(result);

                if (!result.success || result.count > 0) {
                    this.utilService.notify_error(result.msg);
                    return;

                } else {
                    this.utilService.notify_success('Save success');
                    this.popupForm.instance.resetValues();
                    this.popup.visible = false;
                    this.onSearch();
                }

            } catch (err) {
                this.utilService.notify_error('There was an error!');

            }
        }
    }

    // 팝업모드
    popupShown(e): void{
        this.popupForm.instance.getEditor('item_cd').option('disabled', false);
        if (this.popupMode === 'Add'){

        }
        if (this.popupMode === 'Edit') {
            this.popupForm.instance.getEditor('item_cd').option('disabled', true);

            const filtered = this.dsItemcode.filter((el) => el.cd === this.popupForm.instance.getEditor('item_cd').option('value'));

            if (filtered.length > 0) {
              this.popupForm.instance.getEditor('sale_krw_pr').option('value', filtered[0].sale_krw_pr);
              this.popupForm.instance.getEditor('sale_usd_pr').option('value', filtered[0].sale_usd_pr);
            } else {
              this.popupForm.instance.getEditor('sale_krw_pr').option('value', null);
              this.popupForm.instance.getEditor('sale_usd_pr').option('value', null);
            }
        }
        this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
        this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    }

  popupHidden(e): void {
      this.popupForm.instance.resetValues();
  }

    // 검색 초기화
    async onReset(): Promise<void> {
        await this.mainForm.instance.resetValues();
        await this.initForm();
    }

    // 팝업 열기
    showPopup(popupMode, data): void {

        this.changes = [];
        this.popupEntityStore = new ArrayStore({
            data: [],
             key: this.key
        });

        this.popupDataSource = new DataSource({
            store: this.popupEntityStore
        });

        this.popupData = data;
        this.popupData = {tenant: this.G_TENANT, ...this.popupData};
        this.popupMode = popupMode;
        this.popup.visible = true;
        this.onSearchPopup();

    }

    // 팝업 삭제
    async popupDeleteClick(e): Promise<void>{
        try{
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
            if (!await this.utilService.confirm(confirmMsg)) {
                return;
            }

            const deleteContent = this.popupData as Sasd040VO;
            const result = await this.service.mainDelete(deleteContent);

            if (result.success) {
                this.utilService.notify_success('Delete success');
                this.popupForm.instance.resetValues();
                this.popup.visible = false;
                this.onSearch();
            }
        }catch {
            this.utilService.notify_error('There was an error');
        }
    }

    // 팝업모드 초기화 데이터
    onInitNewRow(e): void {
        e.data.m_item_cd = '';
        e.data.c_qty = 0;
        e.data.sale_krw_pr = 0;
        e.data.sale_usd_pr = 0;
    }

    // 품목 선택시 금액 표시
  onChagedItemCd(e): void {
      const filtered = this.dsItemcode.filter((el) => el.cd === e.value);

      if (filtered.length > 0) {
        this.popupForm.instance.getEditor('sale_krw_pr').option('value', filtered[0].sale_krw_pr);
        this.popupForm.instance.getEditor('sale_usd_pr').option('value', filtered[0].sale_usd_pr);
      } else {
        this.popupForm.instance.getEditor('sale_krw_pr').option('value', null);
        this.popupForm.instance.getEditor('sale_usd_pr').option('value', null);
      }

  }

    // 팝업 닫기
    popupCancelClick(e): void{
        this.popup.visible = false;
        this.popupForm.instance.resetValues();
    }

    // 팝업 그리드 수정조건
    onEditorPreparing(e, grid): void {
        if (e.dataField === 'm_item_cd' && e.parentType === 'dataRow') {
            e.editorOptions.disabled = e.row.data.createddatetime ? true : false;
        }
    }

    // 그리드 더블클릭시 호출하는 함수
    rowDblClick(e): void {
        this.deleteBtn.visible = true;
        this.showPopup('Edit', {...e.data});
    }

    // 그리드 셀 이동시 호출하는 함수
    onFocusedCellChangedPopupGrid(e, grid): void {
        this.setFocusRow(e.rowIndex, grid);
    }

    // 포커스 로우
    setFocusRow(index, grid): void {
        grid.focusedRowIndex = index;
    }

    // 그리드 추가
    addClick(): void {
        this.popupGrid.instance.addRow().then(r => {
            const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
            this.setFocusRow(rowIdx, this.popupGrid);
        });
    }

    // 그리드 삭제
    async deleteClick(): Promise<void> {
        const len = this.popupGrid.instance.getVisibleRows().length;
        if ( len > 0 ) {
          let focusedIdx: number  = this.popupGrid.focusedRowIndex;
          if ( focusedIdx < 0 ) {
            focusedIdx = this.popupGrid.instance.getVisibleRows().length - 1;
            this.popupGrid.focusedRowIndex = focusedIdx;
          }

          this.popupGrid.instance.deleteRow(focusedIdx);
          this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

          // 삭제된 로우 위로 포커스
          this.popupGrid.focusedRowIndex = focusedIdx - 1;
        }
	}
}
