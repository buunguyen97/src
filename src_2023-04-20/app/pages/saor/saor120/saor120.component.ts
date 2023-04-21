import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor120Service, Saor120VO} from './saor120.service';

@Component({
  selector: 'app-saor120',
  templateUrl: './saor120.component.html',
  styleUrls: ['./saor120.component.scss']
})
export class Saor120Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: Saor120Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  //Global
  G_TENANT: any;

  mainFormData: Saor120VO = {} as Saor120VO;

  dataSource: DataSource;
  entityStore: ArrayStore;

  dsITEMCATEGORY = [];
  dsUser = []; // 사용자

  key = 'itemcategory1id';
  searchList = [];

  ngOnInit(): void {
    // 폼목카테고리1
    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsITEMCATEGORY = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initCode();
    this.utilService.getGridHeight(this.mainGrid);
  }

  initCode(): void {
    this.mainForm.instance.getEditor('ordDate').option('value', this.bizService.getDay(0, '-'));
  }

  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      this.mainFormData.ordDate = this.mainFormData.ordDate.replace(/-/gi, "");
      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;
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

        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

}
