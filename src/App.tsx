import NoodlePanic from './NoodlePanic'
import DesignReview from './DesignReview'
import './App.less'

export default function App() { return new URLSearchParams(window.location.search).has('review') ? <DesignReview /> : <NoodlePanic /> }
