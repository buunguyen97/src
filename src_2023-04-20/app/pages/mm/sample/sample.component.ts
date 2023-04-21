import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxMapComponent,
  DxPopupComponent,
  DxTreeListComponent,
  DxVectorMapComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {FeatureCollection, SampleService, StatesCollection} from './sample.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {ActivatedRoute} from '@angular/router';
import {CompanyVO} from '../company/company.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import * as mapsData from 'devextreme/dist/js/vectormap-data/world.js';
import {NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels} from '@techiediaries/ngx-qrcode';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('grid1', {static: false}) grid1: DxDataGridComponent;
  @ViewChild('grid2', {static: false}) grid2: DxDataGridComponent;
  @ViewChild('gridExtra', {static: false}) gridExtra: DxDataGridComponent;

  @ViewChild('menuGrid1', {static: false}) menuGrid1: DxDataGridComponent;
  @ViewChild('menuGrid2', {static: false}) menuGrid2: DxDataGridComponent;
  @ViewChild('menuGrid3', {static: false}) menuGrid3: DxDataGridComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;


  @ViewChild('treeList', {static: false}) treeList: DxTreeListComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('sMap', {static: false}) sMap: DxMapComponent;

  @ViewChild(DxVectorMapComponent, {static: false}) vectorMap: DxVectorMapComponent;

  GRID_STATE_KEY = 'sample_page';
  GRID_TITLE = 'GRID_TITLE';
  mainFormData = {};

  // uploadUrl = APPCONSTANTS.BASE_URL_WM + '/receive-service/rcv/rcv/uploadFile';
  uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';
  uploadUrlImage = 'https://concplay.blob.core.windows.net/alporter/';
  uploadImage = '';

  barcodeUrl = '';
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

  dataSource1: DataSource;
  entityStore1: ArrayStore;
  dataSource2: DataSource;
  entityStore2: ArrayStore;

  menuDataSource1: DataSource;
  menuDataSource2: DataSource;
  menuDataSource3: DataSource;
  menuEntityStore1: ArrayStore;
  menuEntityStore2: ArrayStore;
  menuEntityStore3: ArrayStore;

  treeListDatSource: DataSource;
  treeListEntityStore: ArrayStore;

  key = 'uid';

  chkChanges = [];

  dsAcceptType = this.service.dsAcceptType;
  dsAcceptGroup = this.service.dsAcceptGroup;
  dsWarehouse = this.service.dsWarehouse;
  dsItemAdmin = this.service.dsItemAdmin;

  dsRcvStatus = [];
  dsRcvType = [];
  dsCompany = [];
  dsItemId = [];
  dsYN = [{code: 'Y', name: 'Y'}, {code: 'N', name: 'N'}];

  radioGroup = ['radio1', 'radio2'];

  changesMenu1 = [];
  changesMenu2 = [];
  changesMenu3 = [];

  changesTreeList = [];

  products = [];
  sliderValue = 10;

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: CompanyVO;
  // ***** popup ***** //

  /****** MAP ******/

  routes = [];

  options: any;
  center: any;

  markers: FeatureCollection;

  spots: { lat: number; lng: number }[] = [
    // { lat: 48.85952222328431, lng: 2.3347153257887454 },
    // { lat: 48.80528296155103, lng: 2.2111191343824954 },
    // { lat: 48.63132261107716, lng: 2.4308456968824954 },
    // { lat: 48.77633134372322, lng: 2.4665512632887454 },
    // { lat: 48.7871901580939, lng: 2.3127426695387454 },
  ];
  markerOptions: google.maps.MarkerOptions = {};

  polylineOptions = {
    path: [
      // {lat: 48.85952222328431, lng: 2.3347153257887454},
      // {lat: 48.80528296155103, lng: 2.2111191343824954},
      // {lat: 48.63132261107716, lng: 2.4308456968824954}
    ],
    strokeColor: '#32a1d0',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  };

  dataSource = [{
    day: 'Monday',
    oranges: 3,
  }, {
    day: 'Tuesday',
    oranges: 2,
  }, {
    day: 'Wednesday',
    oranges: 3,
  }, {
    day: 'Thursday',
    oranges: 4,
  }, {
    day: 'Friday',
    oranges: 6,
  }, {
    day: 'Saturday',
    oranges: 11,
  }, {
    day: 'Sunday',
    oranges: 4,
  }];

  grossProductData = [{
    state: 'Illinois',
    year1998: 423.721,
    year2001: 476.851,
    year2004: 528.904,
  }, {
    state: 'Indiana',
    year1998: 178.719,
    year2001: 195.769,
    year2004: 227.271,
  }, {
    state: 'Michigan',
    year1998: 308.845,
    year2001: 335.793,
    year2004: 372.576,
  }, {
    state: 'Ohio',
    year1998: 348.555,
    year2001: 374.771,
    year2004: 418.258,
  }, {
    state: 'Wisconsin',
    year1998: 160.274,
    year2001: 182.373,
    year2004: 211.727,
  }];

  areas = [{
    country: 'Russia',
    area: 12,
  }, {
    country: 'Canada',
    area: 7,
  }, {
    country: 'USA',
    area: 7,
  }, {
    country: 'China',
    area: 7,
  }, {
    country: 'Brazil',
    area: 6,
  }, {
    country: 'Australia',
    area: 5,
  }, {
    country: 'India',
    area: 2,
  }, {
    country: 'Others',
    area: 55,
  }];

  populationData = [{
    state: 'USA',
    maleyoung: 29.956,
    malemiddle: 90.354,
    maleolder: 14.472,
    femaleyoung: 28.597,
    femalemiddle: 91.827,
    femaleolder: 20.362,
  }, {
    state: 'Brazil',
    maleyoung: 25.607,
    malemiddle: 55.793,
    maleolder: 3.727,
    femaleyoung: 24.67,
    femalemiddle: 57.598,
    femaleolder: 5.462,
  }, {
    state: 'Russia',
    maleyoung: 13.493,
    malemiddle: 48.983,
    maleolder: 5.802,
    femaleyoung: 12.971,
    femalemiddle: 52.14,
    femaleolder: 12.61,
  }, {
    state: 'Japan',
    maleyoung: 9.575,
    malemiddle: 43.363,
    maleolder: 9.024,
    femaleyoung: 9.105,
    femalemiddle: 42.98,
    femaleolder: 12.501,
  }, {
    state: 'Mexico',
    maleyoung: 17.306,
    malemiddle: 30.223,
    maleolder: 1.927,
    femaleyoung: 16.632,
    femalemiddle: 31.868,
    femaleolder: 2.391,
  }, {
    state: 'Germany',
    maleyoung: 6.679,
    malemiddle: 28.638,
    maleolder: 5.133,
    femaleyoung: 6.333,
    femalemiddle: 27.693,
    femaleolder: 8.318,
  }, {
    state: 'United Kindom',
    maleyoung: 5.816,
    malemiddle: 19.622,
    maleolder: 3.864,
    femaleyoung: 5.519,
    femalemiddle: 19.228,
    femaleolder: 5.459,
  }];

  /****** MAP ******/

  usaMap: any = mapsData.world;

  states: StatesCollection[];

  PAGE_TITLE = '';

  constructor(private service: SampleService,
              public utilService: CommonUtilService,
              private route: ActivatedRoute,
              public gridUtil: GridUtilService
  ) {

    console.log(mapsData);
    this.states = service.getStatesData();

    this.markers = service.getMarkers();
    // this.names = service.getNames();

    let startX = -350;
    // const x = 70;
    // const y = 90;
    const gab = 100;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].coordinates = [startX += gab, 110];
    }

    this.route.queryParams.subscribe(params => {
      this.PAGE_TITLE = 'Home' + ' > ' + 'Business Group' + ' > ' + 'MM' + ' > ' + 'Standard[샘픔]';
    });

    this.products = service.getProducts();

    this.initMap = this.initMap.bind(this);
    // this.initMap();

    this.fnAlert = this.fnAlert.bind(this);
  }

  ngOnInit(): void {

    // 바코드 URL
    const tenant = '1000';
    const soKey = 'WSO10001';

    const domain = APPCONSTANTS.BASE_URL_WM;
    // const domain = 'http://192.168.0.14:10001';
    const port = `/interface-service/qrPage`;
    const param = `?soId=${569}`;

    // const domain = `http://192.168.0.14`;
    // const port = `:4200/src/app/pages/rcv/rcvexpected/aaaaa.html`;
    // const param = `?tenant=${tenant}&soKey=${soKey}`;

    this.barcodeUrl = domain + port + param;

    localStorage.removeItem('salesUploadFileNm');
  }

  ccc(e): void {
    // console.log(e.target.coordinates());
  }

  customizeTooltip(arg: any): any {
    return {
      text: `${arg.percentText} - ${arg.valueText}`,
    };
  }

  /********** 그리드 메소드 ************/
  // 그리드 툴바
  onToolbarPreparing(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    // newToolbarItems.push({
    //   location: 'before',
    //   template(): any {
    //     return `<h4 class="grid_title">${title}</h4>`;
    //   },
    // });

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));         // first
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));        // second
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton')); // third
    e.toolbarOptions.items = newToolbarItems;
  }

  onToolbarPreparingWithBtn(e, grid): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));         // first

    // second
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'add',
        onClick: this.setAddClick(grid)
      }
    });

    // third
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'minus',
        onClick: this.setDeleteClick(grid)
      }
    });

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));        // 4th
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton')); // 5th

    e.toolbarOptions.items = newToolbarItems;
  }

  onToolbarPreparingWithExtraBtn(e, grid): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));         // first

    // second
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'add',
        onClick: this.setAddClick(grid)
      }
    });

    // third
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'minus',
        onClick: this.setDeleteClick(grid)
      }
    });

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));        // 4th
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton')); // 5th

    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        text: '체크 로우 확인',
        onClick: this.fnAlert
      }
    });

    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        text: '파일',
        onClick: this.fnAlert
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async fnAlert(): Promise<void> {

    // 수정된 결과(체크된 컬럼 값이 changes에 담긴다)
    console.log(this.chkChanges);
    // const visibleRows = this.grid2.instance.getVisibleRows();
    //
    // console.log('체크된 로우 - isSelected === true');
    //
    // for (const v of visibleRows) {
    //   // 1. isRowSelected - return true / false;
    //   console.log(v.key + ' _ ' + this.grid2.instance.isRowSelected(v.key));
    //   if (v.isSelected) {
    //     // 2. 체크시 isSelected === true / 체크 해제시 isSelected === false
    //     console.log(v);
    //   }
    // }
  }

  format(value): string {
    return `${value}%`;
  }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem(this.GRID_STATE_KEY, JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem(this.GRID_STATE_KEY);
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  /********** 그리드 메소드 ************/


  /********** 이벤트 메소드 ************/
  setAddClick(grid): any {
    if (grid === this.menuGrid1) {
      return () => {
        this.menuGrid1.instance.addRow().then(r => this.setFocusRow(0, this.menuGrid1));
      };
    } else if (grid === this.menuGrid2) {
      return () => {
        this.menuGrid2.instance.addRow().then(r => this.setFocusRow(0, this.menuGrid2));
      };
    } else {
      return () => {
        this.menuGrid3.instance.addRow().then(r => this.setFocusRow(0, this.menuGrid3));
      };
    }
  }

  setDeleteClick(grid): any {
    if (grid === this.menuGrid1) {
      return () => {
        if (this.menuGrid1.focusedRowIndex > -1) {
          this.menuGrid1.instance.deleteRow(this.menuGrid1.focusedRowIndex);
          this.menuEntityStore1.push([{type: 'remove', key: this.menuGrid1.focusedRowKey}]);
        }
      };
    } else if (grid === this.menuGrid2) {
      return () => {
        if (this.menuGrid2.focusedRowIndex > -1) {
          this.menuGrid2.instance.deleteRow(this.menuGrid2.focusedRowIndex);
          this.menuEntityStore2.push([{type: 'remove', key: this.menuGrid2.focusedRowKey}]);
        }
      };
    } else {
      return () => {
        if (this.menuGrid3.focusedRowIndex > -1) {
          this.menuGrid3.instance.deleteRow(this.menuGrid3.focusedRowIndex);
          this.menuEntityStore3.push([{type: 'remove', key: this.menuGrid3.focusedRowKey}]);
        }
      };
    }
  }

  // addClick(e): void {
  //   this.menuGrid1.instance.addRow().then(r => this.setFocusRow(0, this.menuGrid1));
  // }

  // async deleteClick(e): Promise<void> {
  //   if (this.menuGrid1.focusedRowIndex > -1) {
  //     this.menuGrid1.instance.deleteRow(this.menuGrid1.focusedRowIndex);
  //     this.entityStore1.push([{type: 'remove', key: this.menuGrid1.focusedRowKey}]);
  //   }
  // }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onSearch(): Promise<void> {
    await this.onSearch1();
    await this.onSearch2();

    await this.onSearchMenu1();
    await this.onSearchMenu2();
    await this.onSearchMenu3();

    await this.onSearchTreeList();
  }

  async onSearch1(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getGrid1DataList(this.mainFormData);
      this.grid1.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.entityStore1 = new ArrayStore(
        {
          data: result,
          key: this.key
        }
      );
      this.dataSource1 = new DataSource({
        store: this.entityStore1
      });
      this.grid1.focusedRowKey = null;
      this.grid1.paging.pageIndex = 0;
    }
  }

  async onSearch2(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getGrid2DataList(this.mainFormData);
      this.grid2.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.entityStore2 = new ArrayStore(
        {
          data: result,
          key: this.key
        }
      );
      this.dataSource2 = new DataSource({
        store: this.entityStore2
      });
      this.grid2.focusedRowKey = null;
      this.grid2.paging.pageIndex = 0;
    }
  }

  async onSearchMenu1(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getMenuGrid1DataList(this.mainFormData);
      this.menuGrid1.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.menuEntityStore1 = new ArrayStore(
        {
          data: result,
          key: this.key
        }
      );
      this.menuDataSource1 = new DataSource({
        store: this.menuEntityStore1
      });
      this.menuGrid1.focusedRowKey = null;
      this.menuGrid1.paging.pageIndex = 0;
    }
  }

  async onSearchMenu2(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getMenuGrid2DataList(this.mainFormData);
      this.menuGrid2.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.menuEntityStore2 = new ArrayStore(
        {
          data: result,
          key: this.key
        }
      );
      this.menuDataSource2 = new DataSource({
        store: this.menuEntityStore2
      });
      this.menuGrid2.focusedRowKey = null;
      this.menuGrid2.paging.pageIndex = 0;
    }
  }

  async onSearchMenu3(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getMenuGrid3DataList(this.mainFormData);
      this.menuGrid3.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.menuEntityStore3 = new ArrayStore(
        {
          data: result,
          key: this.key
        }
      );
      this.menuDataSource3 = new DataSource({
        store: this.menuEntityStore3
      });
      this.menuGrid3.focusedRowKey = null;
      this.menuGrid3.paging.pageIndex = 0;
    }
  }

  async onSearchTreeList(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getTreeListDataList(this.mainFormData);
      this.treeList.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.treeListEntityStore = new ArrayStore(
        {
          data: result,
          key: 'keyExpr'
        }
      );
      this.treeListDatSource = new DataSource({
        store: this.treeListEntityStore
      });
      this.treeList.focusedRowKey = null;
      this.treeList.paging.pageIndex = 0;
    }
  }

  selectItem(e): void {
  }

  onEditingStart(e): void {
    // 어플리케이션이 아니면 수정 허용안함
    if (e.data.appId < 0) {
      e.cancel = true;
    }
  }


  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: '1000', company: '', name: '', shortName: '', actFlg: 'Y'});
  }

  onPopupAfterOpen(): void {

    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('company').focus();
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('company').option('disabled', false);

    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    // const result = await this.service.getPopup(data);

    if (this.resultMsgCallback({success: true}, 'PopupSearch')) {
      // this.popupFormData = any;
      this.popupForm.instance.getEditor('company').option('disabled', true);
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

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;

    if (e.element.id === 'Open') {
      // this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      // this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('name').focus()
      );
    }
  }

  /********** 이벤트 메소드 ************/


  /*********** 맵 VIEWER ************/
  initMap(): void {
    this.sMap.apiKey = {google: 'AIzaSyDI3ChJAmSoajg3HmNQNvIoViojmg7HOTo'};
    // this.sMap.center = '37.482489, 126.878240';
    this.sMap.zoom = 17;
    this.sMap.height = '400';
    this.sMap.width = '100%';

    this.sMap.markers = [{
      location: [37.14662571373519, 127.5939137276295],
      tooltip: {
        isShown: true,
        text: 'Alporter',
      },
    }];
  }

  ngAfterViewInit(): void {
    this.initMap();

    // console.log(this.vectorMap);
    this.vectorMap.instance.center([0, 55]);
    this.vectorMap.wheelEnabled = false;
    this.vectorMap.zoomingEnabled = false;
    this.vectorMap.touchEnabled = false;
    this.vectorMap.panningEnabled = false;
  }

  /********** 맵 VIEWER ************/

  // flg: boolean;
  // // 다국어
  // locale: string;
  // formatMessage = formatMessage;
  // locales = [
  //   {
  //     name: '한국어',
  //     value: 'ko',
  //   }, {
  //     name: '영어',
  //     value: 'en',
  //   }, {
  //     name: '중국어',
  //     value: 'cn',
  //   }, {
  //     name: '일본어',
  //     value: 'jp',
  //   },
  //
  //
  // ];
  //
  //
  // ngOnInit(): void {
  //   this.locale = localStorage.getItem(APPCONSTANTS.TEXT_LOCALE);
  // }
  //
  // changeLocale(event): void {
  //   const l = event.selectedItem.value;
  //
  //   localStorage.setItem(APPCONSTANTS.TEXT_LOCALE, l);
  //
  //   if (this.flg === true) {
  //     this.flg = false;
  //     parent.document.location.reload();
  //   } else {
  //     this.flg = true;
  //   }
  // }

  onUploaded(e): void {
    console.log(e);

    // 파일이름 저장
    // localStorage.setItem('wmUploadFileNm', e.file.name);

    localStorage.setItem('salesUploadFileNm', 'generateFileNm.png');
  }

  generateFileNm(e): void {
    this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'newFileName', 'generateFileNm');

    e.component.option('uploadUrl', this.uploadUrl);
  }

  updateQueryStringParameter(uri, key, value): any {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    }
    else {
      return uri + separator + key + '=' + value;
    }
  }

  getUploadImage(): any {

    // this.uploadImage = this.uploadUrlImage + localStorage.getItem('salesUploadFileNm');
    this.uploadImage = this.uploadUrlImage + localStorage.getItem('salesUploadFileNm');

    return this.uploadImage;
  }
}
