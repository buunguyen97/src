import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {WarehouseService, WarehouseVO} from './warehouse.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: WarehouseVO = {} as WarehouseVO;
  // ***** popup ***** //

  // DataSet
  dsYN = [];
  dsLogistics = [];
  dsWarehouseGroup = [];
  dsCountry = [];
  dsUser = [];

  PAGE_PATH = '';
  countryChangeFlg = false;

  autocomplete: any;
  autpCompleteAddressFlg = false;
  selectedAddress1 = '';
  options = {
    componentRestrictions: {country: ''},
    fields: ['address_components', 'geometry', 'name'],
    strictBounds: false,
    types: ['geocode', 'establishment']
  };

  GRID_STATE_KEY = 'mm_warehouse';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  searchAddress = {
    getPacComp: () => {
      return document.getElementsByClassName('pac-container pac-logo');
      // return document.getElementsByName('corpAddress1');
    },
    initPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      for (let i = 0; i < pacComp.length; i++) {
        if (pacComp.item(i)) {
          pacComp.item(i).remove();
        }
      }
    },
    showPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: 9999;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    hidePacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: -1;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    getInputComp: () => {
      return document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
    },
    resetInput: () => {
      this.searchAddress.getInputComp().value = '';
    },
    setInputValue: (value: string) => {
      this.searchAddress.getInputComp().value = value;
    },
    getInputValue: () => {
      return this.searchAddress.getInputComp().value;
    }
  };


  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: WarehouseService
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.initMap = this.initMap.bind(this);
    this.onChangedCountry = this.onChangedCountry.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {

    const pacComp = document.getElementsByClassName('pac-container pac-logo');
    for (let i = 0; i < pacComp.length; i++) {

      if (pacComp.item(i)) {
        pacComp.item(i).remove();
      }
    }

    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');

  }

  initCode(): void {
    // 사용여부, 가상창고여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 물류회사
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, true, null, null).subscribe(result => {
      this.dsLogistics = result.data;
    });

    // 창고그룹
    this.codeService.getCode(this.G_TENANT, 'WAREHOUSEGROUP').subscribe(result => {
      this.dsWarehouseGroup = result.data;
    });

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
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

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;

    this.countryChangeFlg = false;
    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.initMap();
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('name').focus()
      );
    }
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: '', shortName: ''});
  }

  onPopupAfterOpen(): void {

    const pacComp = document.getElementsByClassName('pac-container pac-logo');
    if (pacComp.length > 0) {
      const s = pacComp.item(0).getAttribute('style');
      const zIndexStr = ' z-index: -1;';
      pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
      pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
    }

    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('virtualWhFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('warehouseGroup').option('value', 'OWN');

      this.popupForm.instance.getEditor('warehouse').focus();
      this.initMap();
    } else {
      this.changedCountry(this.popupFormData.countrycd);
      const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
      input.value = this.popupFormData.address1;
      this.autpCompleteAddressFlg = true;
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('warehouse').option('disabled', false);
    this.countryChangeFlg = false;

    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);
    console.log(result.data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      this.popupForm.instance.getEditor('warehouse').option('disabled', true);
    } else {
      return;
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {

      if (await this.execSave()) {
        this.onPopupClose();
      }
    }
  }

  async execSave(): Promise<boolean> {
    try {
      let result;

      const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
      this.popupFormData.address1 = input.value;

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        return true;
      } else {
        return false;
      }
    } catch {
      this.utilService.notify_error('There was an error!');
      return false;
    }
    return false;
  }

  async onPopupDelete(): Promise<void> {

    try {
      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  onChangedCountry(e): void {
    console.log(1);

    if (this.countryChangeFlg) {
      this.searchAddress.resetInput();  // 주소 초기화
      this.popupFormData.engAddress1 = '';
      this.popupFormData.engAddress2 = '';
      this.popupFormData.zip = '';
      this.popupFormData.gps_lat = '';
      this.popupFormData.gps_long = '';

      this.changedCountry(e.value);
    }
    this.countryChangeFlg = true;
  }

  async changedCountry(country: string): Promise<void> {
    // this.autpCompleteAddressFlg = false;
    // const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
    //
    // input.value = '';
    //
    // if (this.autocomplete) {
    //   if (country) {
    //     this.autocomplete.setComponentRestrictions({country});
    //   } else {
    //     this.autocomplete.setOptions(this.options);
    //   }
    // }
    // const pacComp = document.getElementsByClassName('pac-container pac-logo');
    // if (pacComp.length > 0) {
    //   const s = pacComp.item(0).getAttribute('style');
    //   const zIndexStr = ' z-index: 9999;';
    //   pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
    //   pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
    // }
  }

  comfirmAddress(): void {
    const addr = this.searchAddress.getInputValue();

    if (this.popupFormData.countrycd === 'KR') {

      // @ts-ignore
      naver.maps.Service.geocode({
        query: addr
      }, (status, response) => {

        // @ts-ignore
        if (status !== naver.maps.Service.Status.OK) {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }

        const result = response.v2; // 검색 결과의 컨테이너
        const items = result.addresses; // 검색 결과의 배열

        if (items.length === 1) {

          let zipCode = '';
          for (const addrElement of items[0].addressElements) {
            if (addrElement.types.includes('POSTAL_CODE')) {
              zipCode = addrElement.longName;
            }
          }

          if (!zipCode) {
            this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
            return;
          }

          this.searchAddress.setInputValue(items[0].roadAddress);  // 전체 주소
          this.popupFormData.engAddress1 = items[0].englishAddress;  // 영문주소
          this.popupFormData.zip = zipCode;
          this.popupFormData.gps_lat = items[0].y;
          this.popupFormData.gps_long = items[0].x;
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    } else {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({
        address: addr,
      }, (results, status) => {
        if (status === 'OK') {
          if (results.length === 1) {

            let zipCode = '';
            for (const addrElement of results[0].address_components) {
              if (addrElement.types.includes('postal_code')) {
                zipCode = addrElement.long_name;
              }
            }

            if (!zipCode) {
              this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
              return;
            }

            this.searchAddress.setInputValue(results[0].formatted_address);  // 전체 주소
            // this.popupFormData.engAddress1 = results[0].formatted_address;  // 영문주소
            this.popupFormData.zip = zipCode;
            this.popupFormData.gps_lat = results[0].geometry.location.lat().toString();
            this.popupFormData.gps_long = results[0].geometry.location.lng().toString();

          } else {
            this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
            return;
          }
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    }
  }

  async initMap(): Promise<void> {
    // const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
    //
    // if (!this.autocomplete) {
    //   this.autocomplete = await new google.maps.places.Autocomplete(input, this.options);
    //
    //   this.autocomplete.addListener('place_changed', () => {
    //     const place = this.autocomplete.getPlace();
    //
    //     const country = this.popupFormData.countrycd;
    //     if (!place.geometry || !place.geometry.location || !country) {
    //       input.value = this.selectedAddress1;
    //       this.autpCompleteAddressFlg = false;
    //       return;
    //     } else {
    //       this.selectedAddress1 = input.value;
    //
    //       for (const addr of place.address_components) {
    //         if (addr.types.indexOf('postal_code') !== -1) {
    //           this.popupFormData.zip = addr.long_name;
    //         }
    //       }
    //       this.autpCompleteAddressFlg = true;
    //     }
    //   });
    //
    //   input.addEventListener('change', () => {
    //     this.autpCompleteAddressFlg = false;
    //   });
    //   input.addEventListener('blur', (e) => {
    //     if (!this.autpCompleteAddressFlg) {
    //       input.value = '';
    //     }
    //   });
    // }
  }

  // phone 커서 위치
  focusIn(e: any): void {
    let len = 1;
    const textValue = e.component._textValue?.trimEnd();
    if (textValue && textValue.charAt(textValue.length - 1) !== ')') {
      len = textValue.length + 1;
    } else {
      len = e.component._value?.trimEnd().length + 1;
    }

    e.element.children[1].children[0].children[0].onclick = () => {
      if (e.element.children[1].children[0].children[0].selectionStart < textValue.length) {

      } else {
        e.element.children[1].children[0].children[0].selectionStart = len || 1;
        e.element.children[1].children[0].children[0].selectionEnd = len || 1;
      }
    };
  }
}


