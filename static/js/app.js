// State for handling which component should be used in which state
const States = {
    SearchToken : "find-token",
    SelectingList : "shopping-lists",
    FoundAndSelectList : "selected-shopping-list"
}


const store =  new Vuex.Store({
    state: {
        lists: null,
        token: null,
        lists: null,
        listId: null,
        cartId: null,
        state: States.SearchToken, // Start in search token state
    }
})



const lists = {
    data() {
        return {
            state: States.SearchToken, // Start in search token state
            token: null,
            lists: null,
            listId: null,
            cartId: null
        }
    },
    provide() {
        return {
            rootdata: {
                token: this.token, cartId: this.cartId, lists: this.lists, listId: this.listId
            }
        }
    },
    methods: {
        updateLists(token) {
            axios
                .get('/api/shoppingcarts/'+token).then((response) => {
                    this.lists = response.data
                    this.token = token
                    this.state = States.SelectingList
                    console.log(this.state)
                    console.log(this.token)
                    console.log(this.lists)
                }).catch((err) => alert(err)) // Temp alert 404 error
        },
        selectCart(listId){
            axios
                .get('/api/shoppingcarts/'+listId).then((response) => {
                    this.listId = listId
                    this.state = States.FoundAndSelectList
                }).catch((err) => alert(err)) // Temp alert 404 error
        },
        onSelectList(cartId){
            this.cartId = cartId
            this.state = States.FoundAndSelectList
        },
        clearLists(){
            console.log(this.lists)
            this.lists = null
            this.token = null
        },
        // dirty temp fix for passing data to dynamic components (should use vuex for this part)
        currentData(){
            return {
                state: States.SearchToken,  
                token: this.token,
                lists: this.lists
            }
        }
    }
}
const app = Vue.createApp(lists)
app.use(Vuex)

app.component('find-token', {
    //emits: ["updateLists"],
    template: `
        <h2>Simple shopping list app</h2>
        To use it enter a token or click the generate a token button.
        <div style="padding: 10px">
            <input type="text" v-model="token">
            <input type="submit" value="Find token" @click="$parent.updateLists(token)">
            <p v-if="message"> {{message}}</p>
        </div>
    `
})

app.component('shopping-lists', {
    emits: ["selectList"],
    inject: ['rootdata'],
    methods: {
        handleSelectList: function(cartid){
            this.$emit('selectList', cartid)
            alert("Handled")
        }
    },
    template: `
        <div>
            <h2 style="overflow:hidden; text-overflow:ellipsis;">Current token is {{ rootdata.token }}.</h2>
            The following carts are created:
            <ol>
                <li v-for="item in rootdata.lists">
                <a @click.prevent="handleSelectList(item.id)" :key="item.id" href="">
                    {{item.name}}
                </a></li>
            </ol>
        </div>
    `
})

app.component('selected-shopping-list', {
    props: ["rootdata"],
    data(){
        console.log(rootdata)
        return {cart: null, rootdata: rootdata}
    },
    mounted(){
        axios.get("/api/shoppingcart/"+rootdata.cartId)
        .then((response) => {this.cart =  response.data})
        .catch(err => {
            alert(err)
        })
    },
    computed: {
        ifChecked(b){
            return (b) ? "checked" :  ""
        }
    },
    template: `
        <div>
            <ol>
                <li v-for="item in rootdata.items">{{item.name}} <input type="checkbox" {{ ifChecked(item.bougth) }}  ></li>
            </ol>
        </div>
    `
})

app.mount('#app')