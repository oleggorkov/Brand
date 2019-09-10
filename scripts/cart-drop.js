class CartDrop {
    constructor(source, container = '#cart-drop') {
        this.source = source;
        this.container = container;
        this.amount = 0;
        this.countGoods = 0;
        this.cartItems = [];
        this._init(this.source);
    }

    _init(source) {
        if (!localStorage.getItem('cart')) {
            fetch(source)
                .then(result => result.json())
                .then(data => {
                    for (let product of data.cartProducts) {
                        this.cartItems.push(product);
                        this.countGoods += +product.quantity;
                        this._renderItem(product);
                        this._calculateSubtotal(product);
                    }

                    localStorage.setItem('cart', JSON.stringify(this.cartItems));
                    localStorage.setItem('countGoods', this.countGoods);
                    localStorage.setItem('amount', this.amount);

                    this._renderTotal();
                    this._renderButtons();
                    this._renderCount();
                });
        } else {
            this.cartItems = JSON.parse(localStorage.getItem('cart'));
            for (let product of this.cartItems) {
                this._renderItem(product);
            }

            this.countGoods = +localStorage.getItem('countGoods');
            this.amount = +localStorage.getItem('amount');

            this._renderTotal();
            this._renderButtons();
            this._renderCount();
        }


        $('#cart-drop').on('click', '.action', event => {
            this._removeProduct(event.target);
        });

        $('body').on('click', '.add-to-cart', event => {
            this._addProduct(event.target)
        })

    }

    _renderItem(product) {
        let $productContainer = $('<div/>', {
                class: 'cart-drop-flex'
            }),

            $productImg = $(
                `<a class="cart-product" href="#">
                <img src="${product.img}" alt="product" class="cart-product__img">
             </a>`
            ),

            $productDesc = $('<div/>', {
                class: 'cart-product-description'
            }),

            $productName = $(`<h3 class="cart-drop__heading">${product.name}</h3>`),

            $stars = $(`<i class="fas fa-star star"></i>
            <i class="fas fa-star star"></i>
            <i class="fas fa-star star"></i>
            <i class="fas fa-star star"></i>
            <i class="fas fa-star-half-alt star"></i>`),

            $quantAndPrice =
                $(`<p class="cart-drop__quantity"><span data-quant_id="${product.id}">${product.quantity}</span>&nbsp;x&nbsp;&#36;&nbsp;${product.price}</p>`),

            $rmvBtn = $(`<i class="fas fa-times-circle action" data-id="${product.id}"></i>`);

        $productDesc.append($productName);
        $productDesc.append($stars);
        $productDesc.append($quantAndPrice);

        $productImg.appendTo($productContainer);
        $productDesc.appendTo($productContainer);
        $rmvBtn.appendTo($productContainer);

        $productContainer.attr('data-elemId', product.id);

        $productContainer.appendTo(this.container);
    }

    _renderButtons() {
        let $checkoutButton = $(`<a href="checkout.html" class="checkout-btn">Checkout</a>`),
            $cartButton = $(`<a href="shopping-cart.html" class="go-cart-btn">Go&nbsp;to&nbsp;cart</a>`);

        $checkoutButton.appendTo('.cart-drop');
        $cartButton.appendTo('.cart-drop');
    }

    _removeButtons() {
        $('.checkout-btn').remove();
        $('.go-cart-btn').remove();
    }

    _updateTotal() {
        this.amount = 0;
        this.countGoods = 0;
        for (let item of this.cartItems) {
            this.amount += +item.quantity * +item.price;
            this.countGoods += +item.quantity;
        }

        localStorage.setItem('countGoods', this.countGoods);
        localStorage.setItem('amount', this.amount);

        this._renderTotal();
    }

    _calculateSubtotal(product) {
        this.amount += +product.quantity * +product.price;
    }

    _renderTotal() {
        $('.cart-drop__total').remove();

        let $total =
            $(`<div class="cart-drop__total"><span>total</span><span id="total">&#36;&nbsp;${this.amount}</span></div>`);

        $total.appendTo(this.container);
    }

    _addProduct(button) {
        this._removeButtons();

        let productID = +$(button).data('id');

        if (isNaN(productID)) {
            button = button.parentElement;
            productID = +$(button).data('id');
        }

        let find = this.cartItems.find(product => product.id === productID);

        if (find) {
            find.quantity++;
            this.countGoods++;
            this.amount += find.price;
            $(`span[data-quant_id="${find.id}"]`).text(find.quantity);
        } else {
            let product = {
                id: productID,
                img: $(button).data('img'),
                name: $(button).data('name'),
                color: $(button).data('color'),
                size: $(button).data('size'),
                price: +$(button).data('price'),
                quantity: 1,
                shipping: $(button).data('shipping'),
                link: $(button).data('link')
            };

            this.cartItems.push(product);
            this.countGoods += +product.quantity;
            this.amount += +product.price;
            this._renderItem(product);
        }

        localStorage.setItem('cart', JSON.stringify(this.cartItems));
        localStorage.setItem('countGoods', this.countGoods);
        localStorage.setItem('amount', this.amount);

        this._renderTotal();
        this._renderButtons();
        this._renderCount();
    }

    _removeProduct(btn) {
        let productID = +$(btn).data('id'),
            find = this.cartItems.find(product => product.id === productID);

        this.cartItems.splice($.inArray(find, this.cartItems), 1);
        $(btn).parents('.cart-drop-flex').remove();

        localStorage.setItem('cart', JSON.stringify(this.cartItems));

        this._updateTotal();
        this._renderCount();
    }

    _renderCount() {
        const $goodsNumContainer = $('.goods-number');

        if (this.countGoods > 0) {
            $goodsNumContainer.css("background-color", "#f16d7f");
            $goodsNumContainer.text(this.countGoods);
        } else {
            $goodsNumContainer.css("background-color", "transparent");
            $goodsNumContainer.text('');
        }
    }
}