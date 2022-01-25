// State for handling which component should be used in which state
const States = {
    SearchToken : "find-token",
    SelectingList : "shopping-lists",
    FoundAndSelectList : "selected-shopping-list"
}

const lists = {
    data() {
        return {
            state: States.SearchToken, // Start in search token state
            token: null,
            lists: null,
            listId: null
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
    props: ["data"],
    emits: ["selectList"],
    methods: {
        handleSelectList: function(cartid){
            this.$emit('selectList', cartid)
            alert("Handled")
        }
    },
    template: `
        <div>
            <h2 style="overflow:hidden; text-overflow:ellipsis;">Current token is {{ data.token }}.</h2>
            The following carts are created:
            <ol>
                <li v-for="item in data.lists">
                <a @click.prevent="handleSelectList(item.id)" :key="item.id" href="">
                    {{item.name}}
                </a></li>
            </ol>
        </div>
    `
})

app.component('selected-shopping-list', {
    props: ["data"],
    data(){
        return cart = null
    },
    async mounted(){
        this.cart = await axios.get("/api/shoppingcart/"+data.id)
        .then((response) => {return response.data})
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
                <li v-for="item in data.items">{{item.name}} <input type="checkbox" {{ ifChecked(item.bougth) }}  >
            </ol>
        </div>
    `
})

app.mount('#app')