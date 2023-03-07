import { of } from "rxjs";

export class MessageServiceMock {
  open() {
    return {
      afterDismissed: () =>
        of({
          dismissedByAction: false,
        }),
    };
  }
}
