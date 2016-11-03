/**
 * Created by wchan on 2016-10-30.
 */


export default class Room{
    public rooms_fullname: string
    public rooms_shortname: string
    public rooms_number: string
    public rooms_name: string
    public rooms_address: string
    public rooms_lat: number
    public rooms_lon: number
    public rooms_seats: number
    public rooms_type: string
    public rooms_furniture: string
    public rooms_href: string


    constructor(){
        this.rooms_fullname = null
        this.rooms_shortname = null
        this.rooms_number = null
        this.rooms_name = null
        this.rooms_address = null
        this.rooms_lat = null
        this.rooms_lon = null
        this.rooms_seats = null
        this.rooms_type =null
        this.rooms_furniture = null
        this.rooms_href =null
    }

}