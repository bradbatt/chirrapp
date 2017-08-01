import { h, Component } from 'preact'
import firebase from 'firebase'
import split from '../_lib/split'
import { postJSON } from '../_lib/request'
import Form from './Form'
import Thread from './Thread'
import {
  Layout,
  Main,
  Preview,
  Header,
  Logotype,
  LogoWrapper,
  Headline,
  Stats,
  ThreadWrapper,
  PreviewDisclaimer
} from './style.css'
import Logo from './logo.svg'
import { Link } from './_lib/Link.css'

export default class UI extends Component {
  render ({}, { text = 'Hello, world!', auth }) {
    const tweets = split(text)
    const user = getUserFromAuth(auth)
    const { name, screenName, avatarURL } = user || {}

    return (
      <Layout>
        <Main tag='main'>
          <Header tag='header'>
            <Logotype>
              Chirr App
              <LogoWrapper>
                <Logo />
              </LogoWrapper>
            </Logotype>

            <Headline tag='h1'>
              Chirr App makes it easy to plan and post Twitter threads
            </Headline>
          </Header>

          <Form
            text={text}
            onChange={newText => this.setState({ text: newText })}
            onSubmit={() => publish(split(text))}
          />

          <Stats>
            {pluralize(text.length, 'char', 'chars')} ・{' '}
            {pluralize(tweets.length, 'tweet', 'tweets')}
          </Stats>
        </Main>

        <Preview tag='aside'>
          <ThreadWrapper>
            <Thread
              tweets={tweets}
              name={name}
              screenName={screenName}
              avatarURL={avatarURL}
            />
          </ThreadWrapper>

          {user
            ? null
            : <PreviewDisclaimer>
                The thread will be published under your name, this is just a
                preview.
                <br />
                <Link
                  tag='a'
                  href='#'
                  onClick={e => {
                    e.preventDefault()
                    signIn().then(auth => this.setState({ auth }))
                  }}
                >
                  Login to make it personal
                </Link>
              </PreviewDisclaimer>}
        </Preview>
      </Layout>
    )
  }
}

const provider = new firebase.auth.TwitterAuthProvider()

let auth
function signIn () {
  if (auth) {
    return Promise.resolve(auth)
  } else {
    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(_auth => (auth = _auth))
  }
}

function getUserFromAuth (auth) {
  if (!auth) return
  const {
    additionalUserInfo: {
      profile: {
        name,
        screen_name: screenName,
        profile_image_url_https: avatarURL
      }
    }
  } = auth
  return {
    name,
    screenName,
    avatarURL: avatarURL.replace('normal', '200x200')
  }
}

function publish (tweets) {
  const provider = new firebase.auth.TwitterAuthProvider()
  signIn()
    .then(({ credential: { accessToken, secret: accessTokenSecret } }) => {
      postJSON('https://us-central1-chirrapp-8006f.cloudfunctions.net/tweet', {
        accessToken,
        accessTokenSecret,
        tweets
      })
        .then(({ url }) => {
          window.location.href = url
        })
        .catch(err => {
          // TODO: Process failed response
        })
    })
}

function pluralize (size, one, many) {
  return `${size} ${size === 1 ? one : many}`
}
