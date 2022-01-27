
// State for handling which component should be used in which state
const States = {
    SearchToken : "find-token",
    SelectingList : "shopping-lists",
    FoundAndSelectList : "selected-shopping-list"
}

const store = new Vuex.Store({
    debug: true,
    state: {
        lists: null,
        token: null,
        selectedListId: null,
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
            //console.log("Lists are : " + state.lists.name)
            return state.lists
        },
        getCart(state){
            //console.log("Getting cart id.....")
        
            // Apprently a list needs to be stringified first, check back later..
            let newCart = JSON.parse(
                JSON.stringify(state.cart)
            )
            return newCart
        },
        getSelectedListId(state){
            return state.selectedListId
        }
    },
    mutations: {
        setToken(state, token){
            if (this.debug) console.log("Setting token....")
            state.token = token
            if (this.debug) console.log('Token is after ' + token)
        },
        setState(state, newState){
            if (this.debug) console.log("Setting State ....")
            state.currentState = newState
        },
        setLists(state, newLists){
            if (this.debug) console.log('Setting lists')
            state.lists = newLists
            if (this.debug) console.log(this.getters.getLists)

        },
        setCart(state, newCart){
            if (this.debug) console.log("Setting cart....")
            state.cart = newCart
        },
        setSelectedListId(state, listId){
            state.selectedListId = listId
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
        let state =  States.SearchToken // Start in search token state
        let token =  null
        let cart =  null
        let message =  null
        return {
            state,token,cart,message,
        }
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
                this.$store.commit('setToken', token)
                this.$store.commit('setState', States.SelectingList)
                this.$store.dispatch('setLists', lists)
            }
    },
        async onSelectList(listId){
            this.$store.commit('setSelectedListId', listId)
            this.$store.commit('setCart', this.$store.getters.getLists[listId].items)
            this.$store.commit('setState', States.FoundAndSelectList)
        },
    },
    computed: {
        mapToken() { return this.$store.getters.getToken},
        mapState() { return this.$store.getters.getStoreState},
    }
})
app.use(store)



app.component('find-token', {
    emits: ["update-token"],
    methods: {
        updateToken(token){
            this.$emit('update-token', token)
        }
    },
    computed: {
        message(){
            return this.$root.message
        },
        /*
        ...Vuex.mapGetters({
            token: 'getToken'
        })*/
    },
    template: `
        <h2>Simple shopping list app</h2>
        To use it enter a token or click the generate a token button.
        <div style="padding: 10px">
            <input type="text" v-model="token">
            <input type="submit" value="Find token" @click="updateToken(token)">
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
            <li v-for="(item, index) in lists">
            <a @click.prevent="selectList(index)" :key="index" href="">
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
    emits: ['check-box', 'update-cart'],
    computed: {
        ...Vuex.mapGetters({
            cart: 'getCart',
            lists: 'getLists',
            listId: 'getSelectedListId'
        }),
        selectedList(){
            return this.lists[this.listId].id
        }
    },
    methods: {
        ...Vuex.mapMutations({
            setCart: 'setCart'
        }),
        async checkBox(item){
            let selectedList = this.lists[this.listId].id
            await axios.put("/api/shoppingcart/"+selectedList+"/item/"+item.id, {
                "bought": !item.bought
            })
            .then((response) => {
                console.log(response)
            })
            .catch((err) => {
                console.log(err)
            })
        },
        toggleChecked(id){
            return (id) ? `checked` : ``
        },
        async addItem(){
            await axios.post('/api/shoppingcart/'+this.selectedList+'/item/', {name: this.newItem})
            .then((response) => {
                console.log("Success")
                this.setCart(this.lists[this.listId].items)
            })
            .catch((err) => {
                console.log(err)
            })
        }
    },
    template: `
        <div>
            <ol>
                <li v-for="item in cart">{{item.name}} <input type="checkbox" @click="checkBox(item)" v-model="item.bought" ></li>
            </ol>
            <div>
            <input type="text" v-model="newItem"><input @click.prevent="addItem()" type="submit">
            </div>
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