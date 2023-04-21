import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DxTreeViewComponent, DxTreeViewModule} from 'devextreme-angular/ui/tree-view';
import {navigation} from '../../../app-navigation';

import * as events from 'devextreme/events';
import {CookieService} from 'ngx-cookie-service';
import {isNaN} from 'lodash';
import {CommonUtilService} from '../../services/common-util.service';
import {APPCONSTANTS} from '../../constants/appconstants';
import {ComponentBehaviorService} from '../../services/component-behavior.service';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss']
})
export class SideNavigationMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DxTreeViewComponent, {static: true})
  menu: DxTreeViewComponent;

  @Output()
  selectedItemChanged = new EventEmitter<string>();

  @Output()
  openMenu = new EventEmitter<any>();

  private _selectedItem: string;
  @Input()
  set selectedItem(value: string) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }

    this.menu.instance.selectItem(value);
  }

  wholeItems: any[] = [];
  items: any[] = [];

  private _compactMode = false;
  @Input()
  get compactMode(): boolean {
    return this._compactMode;
  }

  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  constructor(private elementRef: ElementRef,
              private cookieService: CookieService,
              private utilService: CommonUtilService,
              private behaviorService: ComponentBehaviorService) {
    this.utilService.getNavigation().then(({items, wholeItems}) => {
      this.items = items;
      this.wholeItems = wholeItems;
    });
    // this.items = this.getNavigation(); // 메뉴 초기화

    // this.items = items;
    // this.wholeItems = wholeItems;
  }

  ngOnInit(): void {

    // 헤더 탭 클릭시
    this.behaviorService.changedSystemTypeObserverable.subscribe((event: Event) => {
      if (event) {
        this.items = this.wholeItems.filter(el => {
          return el.systemType === this.utilService.getSystemType();
        });

        // 탭 변경시 selected 제거
        for (const l1List of this.items) {
          let chk = false;
          for (const l2 of l1List.items) {
            if (l2.selected && l2.selected === true) {
              delete l2.selected;
              chk = true;
              break;
            }
          }
          if (chk) {
            break;
          }
        }
      }
    });
  }

  onItemClick(event): void {
    this.selectedItemChanged.emit(event);
  }

  ngAfterViewInit(): void {
    events.on(this.elementRef.nativeElement, 'dxclick', (e) => {
      this.openMenu.next(e);
    });

    this.menu.instance.collapseAll();
  }

  ngOnDestroy(): void {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }

  // getNavigation(): any[] {
  //   const userId = parseInt(this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_UID), 0);
  //
  //   if (isNaN(userId)) {  // 키가 유효하지 않으면
  //     return navigation.map((item) => {
  //       if (item.path && !(/^\//.test(item.path))) {
  //         item.path = `/${item.path}`;
  //       }
  //       return {...item, expanded: !this._compactMode};
  //     });
  //   }
  //   const menuList = [];
  //   this.utilService.getMenuListForUser(userId, this.utilService.getTenant(), this.utilService.getLanguage()).subscribe(data => {
  //
  //     let title = '';
  //     let menu = {text: '', systemType: '', icon: '', items: [], expanded: true};
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let i = 0; i < data.data.length; i++) {
  //       const obj = data.data[i];
  //
  //       if (!obj.l2path) {
  //         continue;
  //       }
  //
  //       if (!title) {
  //         title = obj.l1text;
  //       }
  //       if (title !== obj.l1text) {
  //         title = obj.l1text;
  //         // @ts-ignore
  //         menuList.push(menu);
  //         menu = {text: '', systemType: '', icon: '', items: [], expanded: false};
  //       }
  //
  //       menu.text = obj.l1text;
  //       menu.icon = obj.l1icon;
  //       menu.systemType = obj.systemType;
  //       menu.expanded = /*!this._compactMode*/false;
  //       menu.items.push({text: obj.l2text, path: (obj.l1path + obj.l2path), expanded: false});
  //
  //       if (i === data.data.length - 1) {
  //         // @ts-ignore
  //         menuList.push(menu);
  //       }
  //     }
  //     this.items = menuList.filter(el => {
  //       return el.systemType === this.utilService.getSystemType();
  //     });
  //   });
  //
  //   this.wholeItems = menuList;
  //   return menuList;
  // }
}

@NgModule({
  imports: [DxTreeViewModule],
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent]
})
export class SideNavigationMenuModule {
}
