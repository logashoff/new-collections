import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { ActionIcon } from '../utils';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let spectator: SpectatorService<MessageService>;
  const createService = createServiceFactory({
    service: MessageService,
    imports: [MatSnackBarModule, MatTooltipModule],
  });

  beforeEach(() => {
    spectator = createService();
  });

  // Fix: Error Could not parse CSS stylesheet
  it.skip('should open snackbar with params', async () => {
    const { service } = spectator;
    jest.spyOn(spectator.service['snackBar'], 'openFromComponent');

    service.open('Hello World', ActionIcon.Export, {
      verticalPosition: 'top',
    });

    expect(service['snackBar'].openFromComponent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: { actionIcon: 'save_alt', message: 'Hello World' },
        duration: 10_000,
        horizontalPosition: 'center',
        panelClass: 'message-container',
        verticalPosition: 'bottom',
      })
    );
  });
});
