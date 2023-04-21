import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import _ from 'lodash';
import {SoinspectService, SoSerialTempVO} from './soinspect.service';
import * as XLSX from 'xlsx';
import {SoVO} from '../so/so.service';

@Component({
  selector: 'app-soinspect',
  templateUrl: './soinspect.component.html',
  styleUrls: ['./soinspect.component.scss']
})
export class SoinspectComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;

  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;
  @ViewChild('serialPopupForm', {static: false}) serialPopupForm: DxFormComponent;
  @ViewChild('serialPopupGrid', {static: false}) serialPopupGrid: DxDataGridComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;
  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'uid';
  mainGrid2key = 'uid';
  // ***** main ***** //

  // serial
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialPopupFormData: any;

  serialTempVO: SoSerialTempVO;

  // DataSet
  dsYN = [];
  dsSoType = [];
  dsOwner = [];
  dsActFlg = [];
  dsWarehouse = [];
  dsSoStatus = [];
  dsItemAdmin = [];
  dsItemId = [];
  dsCompany = [];
  dsShipTo = [];
  dsCountry = [];
  dsPort = [];
  dsCustomerPort = [];
  dsUser = [];
  dsDamageFlg = [];

  // summary
  searchList = [];


  GRID_STATE_KEY = 'so_soinspect';
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');

  loadStateSerial = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_Serial');
  saveStateSerial = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_Serial');

  constructor(public utilService: CommonUtilService,
              private service: SoinspectService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService
  ) {
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();

    this.mainGrid1EntityStore = new ArrayStore(
      {
        data: [],
        key: this.mainGrid1key
      }
    );

    this.mainGrid1DataSource = new DataSource({
      store: this.mainGrid1EntityStore
    });

    this.mainGrid2EntityStore = new ArrayStore(
      {
        data: [],
        key: this.mainGrid2key
      }
    );

    this.mainGrid2DataSource = new DataSource({
      store: this.mainGrid2EntityStore
    });
  }

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.mainGrid2);
    this.initData(this.mainForm);
  }

  initCode(): void {

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, true, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 납품처
    this.codeService.getCompany(this.G_TENANT, null, null, true, null, null, null, null).subscribe(result => {
      this.dsShipTo = result.data;
    });

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSoStatus = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
      this.dsPort = result.data;
      this.dsCustomerPort = _.cloneDeep(this.dsPort);
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    if (data.isValid) {

      if (!!this.mainGrid2DataSource) {
        this.mainGrid2EntityStore.clear();
        this.mainGrid2DataSource.reload();
      }
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {

        this.mainGrid1EntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.mainGrid1key
          }
        );

        this.mainGrid1DataSource = new DataSource({
          store: this.mainGrid1EntityStore
        });
        this.mainGrid1.focusedRowKey = null;
        this.mainGrid1.paging.pageIndex = 0;
      } else {
        return;
      }
    }
  }

  onFocusedRowChanged(e): void {

    if (!!e.row) {
      this.onDetailSearch(e.row.data);
    }
  }

  async onDetailSearch(data): Promise<void> {
    const result = await this.service.getDetail(data);

    if (this.resultMsgCallback(result, 'DetailSearch')) {

      this.mainGrid2EntityStore = new ArrayStore(
        {
          data: result.data.soDetailList,
          key: this.mainGrid2key
        }
      );

      this.mainGrid2DataSource = new DataSource({
        store: this.mainGrid2EntityStore
      });
      this.mainGrid2.focusedRowKey = null;
      this.mainGrid2.paging.pageIndex = 0;
    } else {
      return;
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

  onReset(): void {
    this.mainForm.instance.resetValues();
    this.initData(this.mainForm);
  }

  initData(form): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;

    form.formData = {
      tenant: this.G_TENANT,
      sts: '600',
      // fromShipSchDate: rangeDate.fromDate,
      // toShipSchDate: rangeDate.toDate,
      warehouseId: this.utilService.getCommonWarehouseId(),
      ownerId: this.utilService.getCommonOwnerId()
    };
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === 'Y';
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: '엑셀다운로드',
        onClick: this.exportExcel.bind(this)
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async exportExcel(): Promise<void> {
    const excelHandler = {
      excelFileName: 'serial',
      sheetName: 'Sheet1',
      excelHeader: [['serial']]
    };

    const serialList = this.serialDataSource.items();

    for (const serial of serialList) {
      excelHandler.excelHeader.push([serial.serial]);
    }

    const wb = XLSX.utils.book_new(); // workbook 생성
    const newWorksheet = XLSX.utils.aoa_to_sheet(excelHandler.excelHeader); // 시트 만들기
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.sheetName); // workbook에 새로만든 워크시트에 이름을 주고 붙인다.
    const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});  // 엑셀 파일 만들기
    const fileData = new Blob([this.s2ab(wbout)], {type: 'application/octet-stream'});  // 엑셀 파일 변환

    // 엑셀 다운로드
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(fileData);
    a.download = `${excelHandler.excelFileName}.XLSX`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  s2ab(s: any): any {
    const buf = new ArrayBuffer(s.length);  // convert s to arrayBuffer
    const view = new Uint8Array(buf);       // create uint8array as viewer
    for (let i = 0; i < s.length; i++) {
      // tslint:disable-next-line:no-bitwise
      view[i] = s.charCodeAt(i) & 0xFF;
    }         // convert to octet
    return buf;
  }

  async onSerialPopupOpen(e, datas: any): Promise<void> {
    this.serialPopup.visible = true;
    this.serialTempVO = {} as SoSerialTempVO;
    const voList = ['tenant', 'soId', 'uid', 'itemAdminId', 'itemId', 'pickedQty1',
      'latitude', 'longitude'];

    for (const voName of voList) {

      if (voName === 'uid') {
        this.serialTempVO.soDetailId = datas.data[voName];
      } else {
        this.serialTempVO[voName] = datas.data[voName];
      }
    }

    this.serialPopupFormData = this.serialTempVO;
    const sendData = this.serialTempVO;

    try {
      const result = await this.service.getSerial(sendData);

      this.serialEntityStore = new ArrayStore(
        {
          data: result.data,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });
      this.utilService.notify_success('Search success');
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  onSerialPopupClose(): void {
    this.serialPopup.visible = false;
  }

  onSerialPopupAfterClosed(): void {
    this.onResetFileUploader();
    this.onSerialPopupGridReset();
  }

  onSerialPopupGridReset(): void {

    if (!!this.serialDataSource) {
      this.serialEntityStore.clear();
      this.serialDataSource.reload();
      this.serialPopupGrid.instance.cancelEditData();
    }
  }

  onResetFileUploader(): void {
    this.fileUploader.instance.reset();
    this.onSerialPopupGridReset();
  }

  async onSerialUploadClick(): Promise<void> {

    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const sendData =  await this.serialEntityStore.load();

      if (this.serialTempVO.pickedQty1 !== sendData.length) {
        this.utilService.notify_error('The quantity does not match.');
        return;
      }
      const result = await this.service.saveSerial(sendData);

      if (result.success) {
        this.serialDataSource.reload();
        this.utilService.notify_success('Save success');
        this.onSerialPopupClose();
        this.mainGrid2.instance.cellValue(this.mainGrid2.focusedRowIndex, 'tagQty', sendData.length);
      } else {
        this.utilService.notify_error(result.msg);
      }
    }
  }

  async onSerialDeleteClick(): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.service.deleteSerial(this.serialTempVO);
      try {
        if (result.success) {
          this.fileUploader.instance.reset();
          this.serialEntityStore.clear();
          this.serialDataSource.reload();
          this.utilService.notify_success('Delete success');
          this.mainGrid2.instance.cellValue(this.mainGrid2.focusedRowIndex, 'tagQty', 0);
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async importExcel(excelFile: File): Promise<Array<any>> {
    return new Promise<Array<any>>((resolve, reject) => {
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = excelFile;
      let Sheet1 = [];
      reader.onload = (event: any) => {
        const data = reader.result;
        workBook = XLSX.read(data, {type: 'binary'});
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        const dataString = JSON.stringify(jsonData);
        const mapData = JSON.parse(dataString);

        // const {Sheet1} = mapData;
        Sheet1 = mapData.Sheet1;
        for (const key in Sheet1) {
          if (Sheet1.hasOwnProperty(key)) {
            Sheet1[key].tenant = this.serialTempVO.tenant;
            Sheet1[key].soId = this.serialTempVO.soId;
            Sheet1[key].soDetailId = this.serialTempVO.soDetailId;
          }
        }
        resolve(Sheet1);
      };

      reader.readAsBinaryString(file);
    });
  }

  async onSerialFileUploader(): Promise<void> {

    const result = await this.importExcel(this.fileUploader.value[0]);
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = this.fileUploader.value[0];
    let Sheet1 = [];

    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.Sheet1;
      const serialList = [];
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          if (!Sheet1[key].serial) {
            continue;
          }

          Sheet1[key].tenant = this.serialTempVO.tenant;
          Sheet1[key].soId = this.serialTempVO.soId;
          Sheet1[key].soDetailId = this.serialTempVO.soDetailId;
          Sheet1[key].itemAdminId = this.serialTempVO.itemAdminId;
          Sheet1[key].itemId = this.serialTempVO.itemId;
          Sheet1[key].latitude = this.serialTempVO.latitude;
          Sheet1[key].longitude = this.serialTempVO.longitude;
          serialList.push(Sheet1[key]);
        }
      }

      this.serialEntityStore = new ArrayStore(
        {
          data: serialList,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });
      this.serialDataSource.reload();
    };
    reader.readAsBinaryString(file);
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid1, this);
  }

  // 팝업 추가 부분
  onSerialPopupShown(e): void {
    // this.tagGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    // 팝업 그리드 사이즈 조정
    this.utilService.setPopupGridHeight(this.serialPopup, this.serialPopupForm, this.serialPopupGrid);
  }
}
