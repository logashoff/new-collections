import { provideZonelessChangeDetection } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chrome } from 'src/mocks';
import { ActionIcon } from '../utils';
import { MessageService } from './message.service';

vi.stubGlobal('chrome', chrome);

describe('MessageService', () => {
  let spectator: SpectatorService<MessageService>;
  const createService = createServiceFactory({
    service: MessageService,
    providers: [provideZonelessChangeDetection()],
    imports: [MatSnackBarModule, MatTooltipModule],
  });

  beforeEach(() => {
    spectator = createService();
  });

  // Fix: Error Could not parse CSS stylesheet
  it('should open snackbar with params', async () => {
    const snackBar = spectator.inject(MatSnackBar);

    const { service } = spectator;
    vi.spyOn(snackBar, 'openFromComponent');

    service.open('Hello World', ActionIcon.Export, 'export', {
      verticalPosition: 'top',
    });

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { actionIcon: 'save_alt', message: 'Hello World', actionLabel: 'export' },
        duration: 10_000,
        horizontalPosition: 'center',
        panelClass: 'message-container',
        verticalPosition: 'bottom',
      })
    );
  });
});
