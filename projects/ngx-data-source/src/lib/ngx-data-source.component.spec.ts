import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDataSourceComponent } from './ngx-data-source.component';

describe('NgxDataSourceComponent', () => {
  let component: NgxDataSourceComponent;
  let fixture: ComponentFixture<NgxDataSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxDataSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
