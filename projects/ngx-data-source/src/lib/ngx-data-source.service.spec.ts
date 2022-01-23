import { TestBed } from '@angular/core/testing';

import { NgxDataSourceService } from './ngx-data-source.service';

describe('NgxDataSourceService', () => {
  let service: NgxDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
