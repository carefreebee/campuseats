import React, { useEffect, useState } from "react";
import "./css/Shop.css";
import { useAuth } from "../utils/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar/Navbar";
import AddToCartModal from "./AddToCartModal";
import axios from "../utils/axiosConfig";

const Shop = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { shopId } = useParams(); // Get shopId from URL parameters
    const [shop, setShop] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // Add state for selected item

    const fetchShop = async (shopId) => {
        try {
            console.log("shopId GAYGAYGYAYG", shopId);
            const response = await axios.get(`/shops/${shopId}`);
            setShop(response.data);
            console.log("shop GAYGAYGAY", response.data);
        } catch (error) {
            console.error('Error fetching shop:', error);
            if(error.response.status === 404) {
                navigate('/home');
            }
        }
    };

    const fetchShopItems = async (shopId) => {
        try {
            const response = await axios.get(`/items/${shopId}/shop-items`);
            setItems(response.data);
            console.log("items", response.data);
        } catch (error) {
            console.error('Error fetching shop items:', error);
            // if(error.response.status === 404 ) {
            //     navigate('/home');
            // }
        }
    };

    useEffect(() => {
        // console.log('currentUserasdffffffff:', currentUser);
        // if (!currentUser) {
        //     navigate('/login');
        // } else {
            fetchShop(shopId);
            fetchShopItems(shopId);
        // }
    }, [currentUser, shopId]);

    const closeShowModal = () => {
        setShowModal(false);
    }

    const openModalWithItem = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    }

    if (!shop) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        navigate('/login');
    }

    const renderCategories = (categories) => {
        return Object.values(categories).map((category, index) => (
            <div key={index} className="category-container">
                <h4>{category}</h4>
            </div>
        ));
    };

    return (
        <>
            <div className="o-body">
                <div className="s-container">
                    <div className="s-title-container">
                        <div className="s-photo">
                            <img src={shop.imageUrl} alt="store" className="s-photo-image" />
                        </div>
                        <div className="s-title">
                            <h2 className="font-semibold" style={{ fontSize: '24px' }}>{shop.name}</h2>
                            <p style={{ fontSize: '12px' }}>{shop.address}</p>
                            <div className="s-title-subtext">
                                <h4>Description</h4>
                                <p style={{ fontSize: '12px', fontWeight: 'normal' }}>{shop.desc}</p>
                                <div className="s-shopcat"><h4>Category</h4></div>
                                <div className="s-category">{renderCategories(shop.categories)}</div>
                            </div>
                            <div className="s-fee">    
                                <h4>Delivery Fee</h4>
                                <p>₱{shop.deliveryFee}</p>
                            </div>
                        </div>
                    </div>
                    <div className="s-items-container">
                        <h2 className="font-semibold" style={{ fontSize: '24px' }}>Items</h2>
                        <div className="s-content">
                            {items.map(item => (
                                <div key={item.id} className="s-card" onClick={() => openModalWithItem(item)}>
                                    <div className="s-img">
                                        <img src={item.imageUrl || '/Assets/Panda.png'} className="s-image-cover" alt="store" />
                                    </div>
                                    <div className="s-text">
                                        <div className="s-subtext">
                                            <p className="s-h3">{item.name}</p>
                                            <p className="s-p">{item.description}</p>
                                        </div>
                                        <h3 className="font-semibold">₱{item.price.toFixed(2)}</h3>
                                        <div className="s-plus-icon">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {showModal && <AddToCartModal item={selectedItem} showModal={showModal} onClose={closeShowModal} />}
            </div>
        </>
    );
}

export default Shop;
