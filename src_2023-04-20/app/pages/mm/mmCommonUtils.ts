import {JHttpService} from '../../shared/services/jhttp.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MmCommonUtils {

  constructor(private http: JHttpService) {
  }

  public static FLAG_TRUE = 'Y';
  public static FLAG_FALSE = 'N';

}

