import { Recipe } from "../recipe.model"
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import { DataStorageService } from 'src/app/shared/data-storage.service'
import { Injectable } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { RecipesComponent } from '../recipes.component';

/**
 * In this class we execute this code every time the page is loaded.
 * This is to avoid error when F5 is pressed and not loose our data.
 */
@Injectable({providedIn: 'root'})
 export class RecipesResolverService implements Resolve<Recipe[]> {

  constructor(private dataStorageService: DataStorageService,
              private recipesService: RecipeService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const recipes = this.recipesService.getRecipes();
    if(recipes.length === 0) {
      return this.dataStorageService.fetchRecipes();
    } else {
      return recipes;
    }
  }
}
