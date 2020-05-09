import { Component, OnInit, OnDestroy } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Subscription, Observable } from 'rxjs';
import { LoggingService } from '../logging.service';
import { Store } from '@ngrx/store';
import * as fromShoppingList from './store/shopping-list.reducer'
import * as shoppingListActions from './store/shopping-list.actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ingredients: Ingredient[]}>;
  private subscription: Subscription;

  constructor(private loggingService: LoggingService,
              private store: Store<fromShoppingList.AppState>)
  {}

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');
    this.loggingService.printLog('Hello from ShoppingListComponent ngOnInit');
  }

  onEditItem(index: number) {
    this.store.dispatch(new shoppingListActions.StartEdit(index));
  }

  ngOnDestroy(): void {
  }
}
