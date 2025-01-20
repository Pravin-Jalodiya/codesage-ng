import { ProfileComponent } from "../../components/profile/profile.component";
import { Observable, of, Subject } from "rxjs";
import { CanDeactivateFn } from "@angular/router";
import { MESSAGES, UI_CONSTANTS } from "../constants";

export const FormGuard: CanDeactivateFn<ProfileComponent> = (component): Observable<boolean> => {
	if (component.isEditing) {
		if (component.hasFormChanged()) {
			const decisionSubject : Subject<boolean> = new Subject<boolean>();

			component.confirmationService.confirm({
				message: MESSAGES.CONFIRM.UNSAVED_CHANGES,
				header: 'Unsaved Changes',
				icon: UI_CONSTANTS.ICONS.INFO_CIRCLE,
				acceptButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.DANGER_TEXT,
				rejectButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.TEXT,
				acceptIcon: 'none',
				rejectIcon: 'none',
				accept: () : void => {
					component.resetForm();
					decisionSubject.next(true);
					decisionSubject.complete();
				},
				reject: () : void => {
					decisionSubject.next(false);
					decisionSubject.complete();
				}
			});

			return decisionSubject.asObservable();
		} else {
			component.resetForm();
		}
	}
	return of(true);
};
