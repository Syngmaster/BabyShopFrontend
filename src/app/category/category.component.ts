import {Component, Directive, OnInit} from '@angular/core';
import { DataService } from '../Services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import { Item } from '../Models/item.model';
import {element} from 'protractor';
import {SharedService} from '../Services/shared.service';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  categoryName: string;
  items: Item[] = [];

  initialWishlistSetup = false;

  constructor(private router: ActivatedRoute,
              private data: DataService,
              private shared: SharedService, private rout: Router) {
    this.router.params.subscribe(params => {
      this.categoryName = params.catName;
    });
  }

  ngOnInit() {
    // retrieving items for selected category
    // if sale is selected, fetch sale items
    if (this.categoryName === 'sale') {
      this.data.retrieve_sale_items().subscribe(res => {
        console.log(res);
        this.items = res;
      });
      return;
    }

    this.data.retrieve_items_for_category(this.categoryName).subscribe(res => {
      this.items = res;
    });

  }

  navigateToProductDetails(item: Item) {
    this.rout.navigate(['/product/' + item.id]);
  }

  setSaleAndNewLabels(item: Item, index: number) {

    const typeLabel = document.getElementById('itemTypeLabel' + index) as HTMLElement;
    // if item has no type, need to hide the type label
    if (!item.tp) {
      typeLabel.style.display = 'none';
      return;
    }
    const saleType = item.tp['sale'];
    const newType = item.tp['new'];
    // if both sale and new is false, hide the label
    if ((saleType && saleType === false) && (newType && newType === false)) {
      typeLabel.style.display = 'none';
      return;
    }
    // if item's type is sale, displaying SALE label
    if (saleType && saleType === true) {
      typeLabel.style.display = 'block';
      typeLabel.className = 'tag-sale';
      typeLabel.innerHTML = 'SALE';
      return;
    }
    // if item's type is new, displaying New label
    if (newType && newType === true) {
      typeLabel.style.display = 'block';
      typeLabel.className = 'tag-new';
      typeLabel.innerHTML = 'NEW';
      return;
    }

  }

  setWishlistIcons(item: Item, index: number) {

    if (this.initialWishlistSetup) {
      return;
    }

    const currentUserId = JSON.parse(localStorage.getItem('currentUser')).userId;
    const userIds = item.ws;
    const wishIcon = document.getElementById('wishlist-icon-' + index);

    if (userIds && userIds[currentUserId]) {
      wishIcon.style.backgroundColor = 'red';
    } else {
      wishIcon.style.backgroundColor = 'white';
    }

    if (index + 1 === this.items.length) {
      this.initialWishlistSetup = true;
    }

  }

  addToWishlist(item: Item, index: number) {

    this.data.add_remove_to_wishlist(item).subscribe(result => {
      const wishIcon = document.getElementById('wishlist-icon-' + index);
      const isAdded = result['wishlist'];
      if (isAdded) {
        wishIcon.style.backgroundColor = 'red';
      } else {
        wishIcon.style.backgroundColor = 'white';
      }
      this.updateWishlistCount(isAdded);
    });
  }

  private updateWishlistCount(isAdded: boolean) {
    // getting current wishlist count and updating it
    let currentCount = JSON.parse(localStorage.getItem('wishlist')) as number;
    if (isAdded) {
      currentCount = currentCount + 1;
    } else {
      if (currentCount >= 1) {
        currentCount = currentCount - 1;
      }
    }

    // updating local storage with the result and wishlist count icon
    localStorage.setItem('wishlist', JSON.stringify(currentCount));
    this.shared.changeWishlistValue(currentCount);
  }



}
