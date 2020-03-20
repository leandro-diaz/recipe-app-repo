import { Directive, HostListener, HostBinding } from '@angular/core';

/**
 * With this directive we want on clic even attach the 'open' css class
 * of Bootstrap to the element, and remove when clic again
 */
@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }

}
