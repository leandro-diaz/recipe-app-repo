import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

//with loadChildren and this string nomenclature we implement the lazy modules loading
const AppRoute: Routes = [
    { path: '', redirectTo: '/recipes', pathMatch: 'full' },
    // { path: 'recipes', loadChildren: './recipes/recipes.module#RecipesModule' },
    // { path: 'shopping-list', loadChildren: './shopping-list/shopping-list.module#ShoppingListModule' },
    // { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
    { path: "recipes",
      loadChildren: () =>
        import("./recipes/recipes.module").then(m => m.RecipesModule)
    },
    { path: "shopping-list",
      loadChildren: () =>
        import("./shopping-list/shopping-list.module").then(
          m => m.ShoppingListModule
        )
    },
    { path: "auth",
      loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
    }
]

@NgModule({
    imports: [
        RouterModule.forRoot(AppRoute, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {}
