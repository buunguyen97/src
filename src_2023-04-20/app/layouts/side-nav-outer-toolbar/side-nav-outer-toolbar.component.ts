import {Component, Input, NgModule, OnInit, ViewChild} from '@angular/core';
import {HeaderModule, SideNavigationMenuModule} from '../../shared/components';
import {ScreenService} from '../../shared/services';
import {DxDrawerModule} from 'devextreme-angular/ui/drawer';
import {DxScrollViewComponent, DxScrollViewModule} from 'devextreme-angular/ui/scroll-view';
import {CommonModule} from '@angular/common';

import {NavigationEnd, Router} from '@angular/router';
import {CommonUtilService} from '../../shared/services/common-util.service';
import {COMMONINITSTR} from '../../shared/constants/commoninitstr';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss']
})
export class SideNavOuterToolbarComponent implements OnInit {

  @ViewChild(DxScrollViewComponent, {static: true}) scrollView: DxScrollViewComponent;
  selectedRoute = '';

  menuOpened: boolean;
  temporaryMenuOpened = false;

  @Input()
  title: string;

  menuMode = 'shrink';
  menuRevealMode = 'expand';
  minMenuSize = 0;
  shaderEnabled = false;

  constructor(private screen: ScreenService,
              private router: Router,
              private utilService: CommonUtilService) {
  }

  ngOnInit(): void {
    this.menuOpened = this.screen.sizes['screen-large'];

    /*
     // 메뉴키를 경로에서 UID로 변경하므로 선택화면을 키로 대입
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split('?')[0];
      }
    });
    */

    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  updateDrawer(): void {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation(): any {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick(): any {
    return !this.menuOpened;
  }

  navigationChanged(event): void {
    const path = event.itemData.path;
    const pointerEvent = event.event;

    if (path && this.menuOpened) {
      if (event.node.selected) {
        pointerEvent.preventDefault();
      } else {

        // 메뉴키를 경로에서 UID로 변경하므로 선택화면을 키로 대입
        this.selectedRoute = event.node.key;

        // 페이지 경로 저장
        this.utilService.setPagePath(event.node.text, event.node.parent.text);
        this.router.navigate([path], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
        this.scrollView.instance.scrollTo(0);
      }

      if (this.hideMenuAfterNavigation) {
        this.temporaryMenuOpened = false;
        this.menuOpened = false;
        pointerEvent.stopPropagation();
      }
    } else {
      pointerEvent.preventDefault();
    }
  }

  navigationClick(): void {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }
}

@NgModule({
  imports: [SideNavigationMenuModule, DxDrawerModule, HeaderModule, DxScrollViewModule, CommonModule],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent]
})
export class SideNavOuterToolbarModule {
}
