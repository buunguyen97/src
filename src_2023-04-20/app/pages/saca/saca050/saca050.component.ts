import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {Saca050Service, Saca050VO} from './saca050.service';

@Component({
  selector: 'app-saca050',
  templateUrl: './saca050.component.html',
  styleUrls: ['./saca050.component.scss']
})
export class Saca050Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('clsMon', {static: false}) clsMon: DxDateBoxComponent;

  G_TENANT: any;

  mainFormData: Saca050VO = {} as Saca050VO;
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = 'claim_no';

  GRID_STATE_KEY = 'saca_saca050';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  thisMonth = this.utilService.getFormatMonth(new Date());

  dsInvoiceClsYn = [];
  dsInvoiceType = [];
  constructor(public utilService: CommonUtilService,
              private service: Saca050Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    // 발행여부
    this.dsInvoiceClsYn = [
      {code: 'Y', codeName: this.utilService.convert1('dsInvoiceClsYn.publish', '발행')},
      {code: 'N', codeName: this.utilService.convert1('dsInvoiceClsYn.unpublished', '미발행')},
    ];

    // 발행구분
    this.codeService.getCode(this.G_TENANT, 'INVOICETYPE').subscribe(r => {
      this.dsInvoiceType = r.data;
    });
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    this.mainForm.instance.resetValues();
    this.thisMonth = this.utilService.getFormatMonth(new Date());
    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {

      this.mainFormData.cls_mon = this.clsMon.instance.option('value');

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

  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }
}
