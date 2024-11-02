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

  it('should open snackbar with params', async () => {
    const { service } = spectator;
    const spy = jest.spyOn(spectator.service['snackBar'], 'openFromComponent');

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
