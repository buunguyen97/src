import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvperformregistrationService, RcvTagDetailVO} from './rcvperformregistration.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';

@Component({
    selector: 'app-rcvperformregistration',
    templateUrl: './rcvperformregistration.component.html',
    styleUrls: ['./rcvperformregistration.component.scss']
})
export class RcvperformregistrationComponent implements OnInit, AfterViewInit {

    @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
    @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
    @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
    @ViewChild(DxTreeViewComponent, {static: false}) treeView;

    @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
    @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

    // Global
    G_TENANT: any;
    ACT_FLG_SEARCH_VALUE = 'Y';
    ALLOWED_STS_CODE = RcvCommonUtils.STS_INSTRUCTED;

    mainFormData: RcvTagDetailVO = {} as RcvTagDetailVO;

    // grid
    dataSource: DataSource;
    entityStore: ArrayStore;
    key = 'uid';
    changes = [];

    dsRcvStatus = [];   // 입고상태
    dsRcvType = [];   // 입고타입
    dsItemId = [];   // 품목코드
    dsSupplier = [];   // 공급처
    dsLocation = [];   // 로케이션
    dsActFlg = [];   // 사용여부
    dsDamageFlg = []; // 불량여부
    dsTagStatus = [];   // 태그상태
    dsWarehouse = [];
    dsItemAdmin = [];
    dsItem = [];
    dsOwner = [];
    dsUser = [];

    treeBoxValue = [RcvCommonUtils.STS_INSTRUCTING, RcvCommonUtils.STS_INSTRUCTED];

    // Grid State
    GRID_STATE_KEY = 'rcv_rcvperformregistration1';
    loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
    saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

    constructor(public utilService: CommonUtilService,
                private service: RcvperformregistrationService,
                private codeService: CommonCodeService,
                public gridUtil: GridUtilService) {
        this.G_TENANT = this.utilService.getTenant();
    }

    ngOnInit(): void {
        this.entityStore = new ArrayStore(
            {
                data: [],
                key: this.key
            }
        );
        this.dataSource = new DataSource({
            store: this.entityStore
        });
        // 입고상태
        this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
            this.dsRcvStatus = result.data;
        });

        // 입고타입
        this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
            this.dsRcvType = result.data;
        });

        // 공급처
        this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
            this.dsSupplier = result.data;
        });

        // 화주(공통 화주)
        this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
            this.dsOwner = result.data;
        });

        // 물품
        this.codeService.getItem(this.G_TENANT).subscribe(result => {
            this.dsItemId = result.data;
        });

        // 로케이션
        this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
            this.dsLocation = result.data;
        });

        // 사용여부
        this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
            this.dsActFlg = result.data;
        });

        // 불량여부
        this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
            this.dsDamageFlg = result.data;
        });

        // 태그상태
        this.codeService.getCode(this.G_TENANT, 'RCVTAGSTATUS').subscribe(result => {
            this.dsTagStatus = result.data;
        });

        this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
            this.dsWarehouse = result.data;
        });

        this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
            this.dsItemAdmin = result.data;
        });

        this.codeService.getItem(this.G_TENANT).subscribe(result => {
            this.dsItem = result.data;
        });

        this.codeService.getUser(this.G_TENANT).subscribe(result => {
            this.dsUser = result.data;
        });
    }

    // 그리드 품목 선택시 시리얼 여부
    setItemValue(rowData: any, value: any): void {
        rowData.itemId = value;
        rowData.unit = value;
    }

    ngAfterViewInit(): void {
        this.utilService.getFoldable(this.mainForm, this.foldableBtn);
        this.utilService.getGridHeight(this.mainGrid);
        this.initForm();
    }

    async onSearch(): Promise<void> {
        const data = this.mainForm.instance.validate();

        if (data.isValid) {
            this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
            this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
            this.mainFormData.stsList = this.treeBoxValue;
            const result = await this.service.get(this.mainFormData);

            if (!result.success) {
                this.utilService.notify_error(result.msg);
                return;
            } else {
                this.mainGrid.instance.cancelEditData();
                this.utilService.notify_success('search success');

                this.entityStore = new ArrayStore(
                    {
                        data: result.data,
                        key: this.key
                    }
                );
                this.dataSource = new DataSource({
                    store: this.entityStore
                });
                await this.mainGrid.instance.deselectAll();
                this.mainGrid.focusedRowKey = null;
                this.mainGrid.paging.pageIndex = 0;
            }
        }
    }

    onFocusedCellChanging(e): void {
        this.setFocusRow(e.rowIndex, this.mainGrid);
    }

    setFocusRow(index, grid): void {
        grid.focusedRowIndex = index;
    }

    async executeConfirmReceive(): Promise<void> {
        const dataList = this.mainGrid.instance.getSelectedRowsData();

        // const changes = this.collectGridData(this.changes);
        if (dataList.length > 0) {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('instruct'));
            if (!await this.utilService.confirm(confirmMsg)) {
                return;
            }

            // 수정 데이터 반영
            await this.mainGrid.instance.saveEditData();

            for (const data of dataList) {
                // const filtered = changes.filter(el => el.uid === data.uid);

                // if (filtered.length > 0) {

                // data.qty1 = filtered[0].qty1;

                if (data.instructQty1 !== data.qty1) {
                    // 예정수량과 실적수량이 일치하지 않습니다.
                    const message = this.utilService.convert('not_equal_values',
                        this.utilService.convert('rcvTagDetail.instructQty1'), this.utilService.convert('rcvTagDetail.loadQty1'));
                    this.utilService.notify_error(message);
                    // this.mainGrid.focusedRowKey = data.uid;
                    return;
                }
                // } else {
                //   const message = this.utilService.convert('com_valid_required', this.utilService.convert('rcvTagDetail.loadQty1'));
                //   this.utilService.notify_error(message);
                //   return;
                // }
            }
            const result = await this.service.executeConfirmReceive(dataList);

            if (!result.success) {
                this.utilService.notify_error(result.msg);
                return;
            }
        } else {
            // 적치 목록을 선택하세요.
            const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvInstructList'));
            this.utilService.notify_error(msg);
            return;
        }
        await this.mainGrid.instance.deselectAll();
        await this.onSearch();
    }

    collectGridData(changes: any): any[] {
        const gridList = [];
        for (const rowIndex in changes) {
            // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
            if (changes[rowIndex].type === 'insert') {
                gridList.push(Object.assign({
                    operType: changes[rowIndex].type,
                    uid: null,
                    tenant: this.G_TENANT
                }, changes[rowIndex].data));
            } else if (changes[rowIndex].type === 'remove') {
                gridList.push(
                    Object.assign(
                        {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
                );
            } else {
                gridList.push(
                    Object.assign(
                        {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
                    )
                );
            }
        }
        return gridList;
    }

    async onReset(): Promise<void> {
        await this.mainForm.instance.resetValues();
        await this.initForm();
    }

    initForm(): void {
        const rangeDate = this.utilService.getDateRange();

        this.fromRcvSchDate.value = rangeDate.fromDate;
        this.toRcvSchDate.value = rangeDate.toDate;

        // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', rangeDate.fromDate);
        // this.mainForm.instance.getEditor('toRcvSchDate').option('value', rangeDate.toDate);
        this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
        this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
        this.treeBoxValue = [RcvCommonUtils.STS_INSTRUCTING, RcvCommonUtils.STS_INSTRUCTED];
        this.mainForm.instance.focus();
    }

    updateSelection(treeView): void {
        if (!treeView) {
            return;
        }

        treeView.unselectAll();

        if (this.treeBoxValue) {
            this.treeBoxValue.forEach(((value) => {
                treeView.selectItem(value);
            }));
        }
    }

    onDropDownBoxValueChanged(e): void {
        this.updateSelection(this.treeView && this.treeView.instance);
    }

    onTreeViewReady(e): void {
        this.updateSelection(e.component);
    }

    onTreeViewSelectionChanged(e): void {
        this.treeBoxValue = e.component.getSelectedNodeKeys();
    }

    onSelectionChanged(e): void {
        const selectedRowKey = e.currentSelectedRowKeys;
        // 유효한 입고상태가 아닐 경우
        this.mainGrid.instance.byKey(selectedRowKey).then(val => {
            const sts = val.sts;
            if (sts !== this.ALLOWED_STS_CODE) {
                this.mainGrid.instance.deselectRows(selectedRowKey);
                return;
            }
        });

        const dataList = e.selectedRowsData;
        dataList.forEach(el => {
            if (el.sts !== this.ALLOWED_STS_CODE) {
                this.mainGrid.instance.deselectAll();
                return;
            }
        });
    }
}
