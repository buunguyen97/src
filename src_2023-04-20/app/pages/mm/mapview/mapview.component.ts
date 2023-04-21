import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxMapComponent} from 'devextreme-angular';
import {MapviewService, MapViewVO} from './mapview.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';


@Component({
  selector: 'app-mapview',
  templateUrl: './mapview.component.html',
  styleUrls: ['./mapview.component.scss']
})
export class MapviewComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('gridPopup', {static: false}) gridPopup: DxDataGridComponent;
  @ViewChild('mainPopup', {static: false}) mainPopup: DxMapComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  // Global
  G_TENANT: any;

  // SearchForm
  mainFormData: MapViewVO = {} as MapViewVO;
  popupFormData: any;

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  selectedRows: number[];
  deleteRowList = [];
  key = 'uid';

  currLat: string;
  currLong: string;

  dsActFlg = []; // 사용여부
  dsSupplier = []; // 공급처
  dsItemId = []; // 품목코드
  dsUser = [];

  dataSourcePopup: DataSource;
  entityStorePopup: ArrayStore;
  popupData: MapViewVO;
  popupVisible = false;
  popupMode = 'Add';

  routes = [];

  options: google.maps.MapOptions = {
    gestureHandling: 'cooperative',
  };
  center: any;

  centerPopup: any;

  zoomValue = 2;
  spots: { lat: number; lng: number }[] = [
    {lat: 48.85952222328431, lng: 2.3347153257887454},
    {lat: 48.80528296155103, lng: 2.2111191343824954},
    {lat: 48.63132261107716, lng: 2.4308456968824954},
  ];

  spotsPopup: { lat: number; lng: number }[] = [
    {lat: 48.85952222328431, lng: 2.3347153257887454}
  ];

  markerOptions: google.maps.MarkerOptions = {};

  polylineSymbol = {
    // path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 4,
    // strokeColor: '#393',
  };

  polylineOptionsPopup = {
    path: [],
    strokeColor: '#32a1d0',
    strokeOpacity: 1.0,
    strokeWeight: 2,
    icons: [
      {
        icon: this.polylineSymbol,
        offset: '100%',
        repeat: '10%'
      }
    ]
  };

  GRID_STATE_KEY = 'mm_mapview1';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    private service: MapviewService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupCancelClick = this.popupCancelClick.bind(this);
  }

  ngOnInit(): void {
    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  ngAfterViewInit(): void {
    // this.initMap();
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
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
            key: 'serial'
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  onFocusedRowChanged(e): void {
    const lat = Number(e.component.cellValue(e.newRowIndex, 'latitude'));
    const lng = Number(e.component.cellValue(e.newRowIndex, 'longitude'));

    this.centerPopup = {lat, lng};
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  popupShown(e): void {
    this.gridPopup.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
    // this.utilService.getPopupGridHeight(this.gridPopup, this.mainPopup);
  }

  popupClosed(e): void {
  }

  popupCancelClick(e): void {
    this.popupVisible = false;

    // 재조회
    // this.onSearch();
  }

  onRowDblClick(e): void {
    this.showPopup('Trace', {...e.data});
  }

  // Popup 관련
  showPopup(popupMode, data): void {
    // this.initGridMap();
    this.popupData = {tenant: this.G_TENANT, ...data};
    this.popupMode = popupMode;
    this.popupVisible = true;

    this.popupSearch();
  }

  async popupSearch(): Promise<void> {

    const mainGridIdx = this.mainGrid.focusedRowIndex;
    // 시리얼 검색
    if (mainGridIdx !== -1) {
      // Service의 조회 호출
      // Service의 get 함수 생성
      const searchCnd = {
        tenant: this.G_TENANT,
        serial: this.mainGrid.instance.cellValue(mainGridIdx, 'serial')
        // txType: this.mainGrid.instance.cellValue(mainGridIdx, 'txType'),
        // key: this.mainGrid.instance.cellValue(mainGridIdx, 'key'),
        // lineNo: this.mainGrid.instance.cellValue(mainGridIdx, 'lineNo'),
      };
      const result = await this.service.getDetail(searchCnd);
      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.gridPopup.instance.cancelEditData();
        this.utilService.notify_success('search success');

        const pointList: { lat: number; lng: number }[] = [];
        // tslint:disable-next-line:forin
        for (const idx in result.data) {
          const point = {lat: Number(result.data[idx].latitude), lng: Number(result.data[idx].longitude)};
          pointList.push(point);
        }

        this.zoomValue = 2;
        this.spotsPopup = pointList;
        this.polylineOptionsPopup = {
          path: pointList,
          strokeColor: '#32a1d0',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          icons: [
            {
              icon: this.polylineSymbol,
              offset: '100%',
              repeat: '20%'
            }
          ]
        };

        this.centerPopup = {
          lat: pointList[0].lat,
          lng: pointList[0].lng,
        };

        this.entityStorePopup = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.dataSourcePopup = new DataSource({
          store: this.entityStorePopup
        });

        this.gridPopup.focusedRowKey = null;
        this.gridPopup.paging.pageIndex = 0;
      }
    } else {
      this.utilService.notify_error('Not allowed');
    }
  }


}
