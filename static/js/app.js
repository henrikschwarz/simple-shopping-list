
// State for handling which component should be used in which state
const States = {
    SearchToken : "find-token",
    SelectingList : "shopping-lists",
    FoundAndSelectList : "selected-shopping-list"
}

const store = new Vuex.Store({
    state: {
        lists: null,
        token: null,
        cart: null,
        currentState: States.SearchToken, // Start in search token state
    },
    getters: {
        getToken(state){
            //console.log("Getting token....")
            return state.token
        },
        getStoreState(state){
            //console.log('Getting state....')
            return state.currentState
        },
        getLists(state){
            //console.log("Get lists....")
            //console.log("Lists are : " + state.lists.name)
            return state.lists
        },
        getCart(state){
            console.log("Getting cart id.....")
            console.log(state.cart)
        
            // Apprently a list needs to be stringified first, check back later..
            let newCart = JSON.parse(
                JSON.stringify(state.cart)
            )
            return newCart
        }
    },
    mutations: {
        setToken(state, token){
            //console.log("Setting token....")
            state.token = token
            //console.log('Token is after ' + token)
        },
        setState(state, newState){
            //console.log("Setting State ....")
            state.currentState = newState
        },
        setLists(state, newLists){
            //console.log('Setting lists')
            state.lists = newLists
            //console.log(this.getters.getLists)

        },
        setCart(state, newCart){
            //console.log("Setting cart....")
            state.cart = newCart

        }
    },
    actions: {
        setLists ({ commit }, payload) {
            commit('setLists', payload)
        },
        setCart ({ commit }, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('setCart', payload)
                    resolve()
                }, 10000)
            })
        }
    }
})


const app = Vue.createApp({
    data() {
        return {
            state: States.SearchToken, // Start in search token state
            token: null,
            cart: null,
            message: null
        }
    },
    beforeCreate(){
        this.token = this.$store.getters.getState
        this.token = null
        this.message = null
    },
    methods: {
        checkToken(){
            return (this.$store.state.token) ? this.$store.commit('setState',States.SelectingList) : null
        },
        async onUpdateToken(token) {
            let lists= null
            await axios.get('/api/shoppingcarts/'+token).then((response) => {
                lists =  response.data
            }).catch((err)=> {
                console.log("Error: "+ err)
                return null
            })

            if (lists){
                //console.log("Updating the store with: ")
                //console.log(token)
                this.$store.commit('setToken', token)
                this.$store.commit('setState', States.SelectingList)
                this.$store.dispatch('setLists', lists)
            }
    },
        async onSelectList(cartId){
            let cart = null
            await axios.get('/api/shoppingcart/1/items/').then((response) => {
                cart = response.data
                console.log(cart)
            }).catch((err) => {
                console.log("Error : " + err)
                return null
            })
            if (cart != null){
                this.$store.commit('setCart', cart)
                this.$store.commit('setState', States.FoundAndSelectList)
            }
            /*
            if (cart != null){
                this.$store.dispatch('setCart', cart).then(() => {
                    this.$store.commit('setState', States.FoundAndSelectList)
                })
            }
            */
        },
    },
    computed: {
        mapToken() { return this.$store.getters.getToken},
        mapState() { return this.$store.getters.getStoreState},
    }
})
app.use(store)



app.component('find-token', {
    emits: ["updateToken"],
    methods: {
        updateToken(token){
            //console.log(token)
            this.$emit('update-token', token)
        }
    },
    template: `
        <h2>Simple shopping list app</h2>
        To use it enter a token or click the generate a token button.
        <div style="padding: 10px">
            <input type="text" v-model="token">
            <input type="submit" value="Find token" @click="$emit('updateToken', token)">
            <p v-if="message"> {{message}}</p>
        </div>
    `
})

app.component('shopping-lists', {
    emits: ["select-list"],
    computed: {
        ...Vuex.mapGetters({
            token: 'getToken',
            lists: 'getLists'
        })
    },
    methods: {
        selectList(itemId){
            this.$emit('select-list', itemId)
        }
    },
    template: `
    <div>
        <h2 style="overflow:hidden; text-overflow:ellipsis;">Current token is {{ token }}.</h2>
        {{ lists }}
        The following carts are created:
        <ol>
            <li v-for="item in lists">
            <a @click.prevent="selectList(item.id)" :key="item.id" href="">
                {{item.name}}
            </a>
            <ol>
                <li v-for="i in item.items"> {{ i }} </li>
            </ol>
            </li>
        </ol>
    </div>
`
})


app.component('selected-shopping-list', {
    computed: {
        ...Vuex.mapGetters({
            lists: 'getLists',
            cart: 'getCart'
        })
    },
    methods: {
        returnCheckInput(item){
            if (item.bought){
                return `<input type="checkbox" checked></li>`
            }
            return `<input type="checkbox" >`
        }
    },
    template: `
        <div>
            <ol>
                <li v-for="item in cart">{{item.name}} <checkbox :bool="item.bought"></checkbox> </li>
            </ol>
        </div>
    `
})

app.component('checkbox', {
    props: ['bool'],
    template: `
        <input type="checkbox" v-if="bool" checked>
        <input type="checkbox" v-if="!bool">
    `
})

app.mount('#app')