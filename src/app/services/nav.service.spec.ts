import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { EMPTY, firstValueFrom, of } from 'rxjs';

import { NavService } from './nav.service';

describe('NavService', () => {
  let spectator: SpectatorService<NavService>;
  const createService = createServiceFactory({
    service: NavService,
    imports: [MatSnackBarModule, MatBottomSheetModule],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: of({
            groupId: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
            tabId: 123,
          }),
        },
      },
      {
        provide: Router,
        useValue: {
          url: '/',
          events: EMPTY,
          navigate() {},
        },
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should navigate with values', () => {
    jest.spyOn(spectator.service['router'], 'navigate');

    spectator.service.setParams('6ab9c99e-8942-4236-ad6e-7e38c51da810', 218);

    expect(spectator.service['router'].navigate).toHaveBeenCalled();

    spectator.service.reset();

    expect(spectator.service['router'].navigate).toHaveBeenCalledTimes(2);
  });

  it('should have params set', async () => {
    const groupIdParam = await firstValueFrom(spectator.service.paramsGroupId$);

    expect(groupIdParam).toBe('7dd29b1c-dfab-44d4-8d29-76d402d24038');

    const tabIdParam = await firstValueFrom(spectator.service.paramsTabId$);

    expect(tabIdParam).toBe(123);
  });
});
