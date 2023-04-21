import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtProdRelStatusService, PtProdRelStatusVO} from './pt-prod-rel-status.service';

@Component({
  selector: 'app-pt-prod-rel-status',
  templateUrl: './pt-prod-rel-status.component.html',
  styleUrls: ['./pt-prod-rel-status.component.scss']
})
export class PtProdRelStatusComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: PtProdRelStatusVO = {} as PtProdRelStatusVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  treeKey = 'uid';
  key = 'path';

  dsUnitStyle = [];
  dsItemId = [];
  dsFilteredItemId = [];
  dsRevision = [];
  dsUser = [];
  searchList = [];

  GRID_STATE_KEY = 'mm_ptprodrelstatus';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');

  constructor(
    public utilService: CommonUtilService,
    public service: PtProdRelStatusService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  ngAfterViewInit(): void {

    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 품목관리사
    // this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
    //   this.dsItemAdminId = result.data;
    // });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // revision
    this.codeService.getRevision(this.G_TENANT).subscribe(result => {
      this.dsRevision = result.data;
      // this.dsfilteredRevision = this.dsRevision.filter(el => el.revision === this.utilService.getCommonItemId());
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  initForm(): void {
    // this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    const rangeDate = this.utilService.getDateRange();

    this.mainForm.instance.getEditor('fromWorkDate').option('value', rangeDate.fromDate);
    this.mainForm.instance.getEditor('toWorkDate').option('value', rangeDate.toDate);

    this.mainForm.instance.focus();
  }


  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {

      this.mainFormData.itemAdminId = this.utilService.getCommonItemAdminId();
      console.log(this.mainFormData);
      const result = await this.service.get(this.mainFormData);

      this.searchList = result.data;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        result.data.forEach(el => {

          let level = Number(el.level);

          while (level > 0) {
            if (level === Number(el.level)) {
              el.childItemName = '' + el.childItemName;
            }

            el.childItemName = '►' + el.childItemName;

            level--;
          }
        });

        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

}
