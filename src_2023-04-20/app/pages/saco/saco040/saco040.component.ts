import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import { CommonCodeService } from 'src/app/shared/services/common-code.service';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { GridUtilService } from 'src/app/shared/services/grid-util.service';
import { Saco010VO } from '../saco010/saco010.service';
import {Saco040Service, Saco040VO} from './saco040.service';
import {DxDateBoxComponent} from 'devextreme-angular';

@Component({
  selector: 'app-saco040',
  templateUrl: './saco040.component.html',
  styleUrls: ['./saco040.component.scss']
})
export class Saco040Component implements OnInit, AfterViewInit {

    constructor( public utilService: CommonUtilService
               , private service: Saco040Service
               , private codeService: CommonCodeService
               , private bizService: BizCodeService
               , public  gridUtil: GridUtilService
               ){
                    this.G_TENANT = this.utilService.getTenant();
                    this.userGroup = this.utilService.getUserGroup();
                    this.userCompany = this.utilService.getCompany();
               }
    @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
    @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
    @ViewChild('fromDate', {static: false}) fromDate: DxDateBoxComponent;
    @ViewChild('toDate', {static: false}) toDate: DxDateBoxComponent;

    dsExpt = []; // 거래처(수출사)
    dsOrdGb = []; // 주문구분
    dsUser = [];

    // Global
    G_TENANT: any;
    userGroup: any;
    userCompany: any;

    mainFormData: Saco040VO = {} as Saco040VO;

    // Grid Data
    dataSource: DataSource;
    entityStore: ArrayStore;

    key = ['depo_no', 'claim_no'];

    // Grid State
    GRID_STATE_KEY = 'saor_saco040_1';
    loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
    saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

    ngOnInit(): void {
    // 수출사
    if (this.userGroup === '3') {
      this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
        this.dsExpt = result.data;
      });
    } else {
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsExpt = result.data;
      });
    }

    this.dsOrdGb = [ {cd: '1', nm: '판매'}
                       , {cd: '2', nm: '렌탈'}];

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    }

    ngAfterViewInit(): void {
        this.initForm();
        this.utilService.getGridHeight(this.mainGrid);
    }

    initForm(): void {
        // 공통 조회 조건 set
      const rangeDate = this.utilService.getDateRange();

      this.fromDate.value = rangeDate.fromDate;
      this.toDate.value = rangeDate.toDate;
    }

    onFocusedCellChanging(e, grid): void {
        grid.focusedRowIndex = e.rowIndex;
    }

    async onReset(): Promise<void> {
        await this.mainForm.instance.resetValues();
        await this.initForm();
    }

    // 조회
    async onSearch(): Promise<void>{

        const data = this.mainForm.instance.validate();
        if (data.isValid) {

          this.mainFormData.fromDate = document.getElementsByName('fromDate').item(1).getAttribute('value');
          this.mainFormData.toDate = document.getElementsByName('toDate').item(1).getAttribute('value');

          const result = await this.service.mainList(this.mainFormData);

          if (!result.success) {
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

    // 달력 년/월 표현식
    clsMon(rowData): any {

      if (rowData.cls_mon !== undefined && rowData.cls_mon !== null) {
        const clsMon = rowData.cls_mon;
        const yy = clsMon.substring(0, 4);
        const mm = clsMon.substring(4, 6);
        const result = yy + '-' + mm;
        return result;
      }
    }
}
