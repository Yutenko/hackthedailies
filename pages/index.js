import { useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {

  const bookmarklet = "javascript:(function()%7Bif%20(!document.getElementById('hackthedailies'))%20%7Bvar%20jsCode%20%3D%20document.createElement('script')%3BjsCode.id%20%3D%20'hackthedailies'jsCode.setAttribute('src'%2C%20'https%3A%2F%2Fhackthedailies.vercel.app%2Fpublic%2Fscript.js')%3Bdocument.body.appendChild(jsCode)%3B%7D%7D)()"

  return (
    <div className={styles.container}>

      <a href={bookmarklet}>test</a>


    </div>
  )
}
