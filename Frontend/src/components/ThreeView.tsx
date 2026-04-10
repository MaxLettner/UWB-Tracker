import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

export interface ThreeViewHandle {
  updateTargetPosition: (x: number, y: number, z: number) => void
  setScale: (s: number) => void
}

const ThreeView = forwardRef<ThreeViewHandle, {}>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  //internal refs for Three.js objects
  const sphereRef = useRef<THREE.Mesh | null>(null)

  const scaleRef = useRef<number | null>(null)

  //expose the movement method to App.tsx
  useImperativeHandle(ref, () => ({
  updateTargetPosition(x, y, z) {
    if (sphereRef.current) {
      if (scaleRef.current != null) {
        sphereRef.current.position.set(
          x / scaleRef.current,
          y / scaleRef.current,
          z / scaleRef.current
        )
      } else {
        console.error('No scale was set, yet a coordinate tried to show.')
      }
    }
  },
  setScale(s) {
    scaleRef.current = s
  }
}))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const aspect = container.clientWidth / container.clientHeight
    const s = 1
    const camera = new THREE.OrthographicCamera(-s * aspect, s * aspect, s, -s, 0.1, 1000)
    camera.position.set(3, 2.5, 2.5)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0.5, 0.5, 0.5)
    controls.enableZoom = false
    controls.maxPolarAngle = 1.2
    controls.minPolarAngle = 1.2
    controls.enableDamping = true

    // 1. THE CUBE
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
    const cubeEdges = new THREE.EdgesGeometry(cubeGeo)
    const cube = new THREE.LineSegments(
      cubeEdges,
      new THREE.LineBasicMaterial({ color: 0x00a000, linewidth: 3 })
    )
    // Align corner to 0,0,0
    cube.translateX(0.5)
    cube.translateY(0.5)
    cube.translateZ(0.5)
    scene.add(cube)

    // 2. THE TARGET SPHERE
    const sphereGeo = new THREE.SphereGeometry(0.03)
    const sphere = new THREE.Mesh(
      sphereGeo, 
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    )
    
    // Initial position: "Way off screen"
    sphere.position.set(100, 100, 100)
    
    scene.add(sphere)
    sphereRef.current = sphere

    let animationId: number
    const render = () => {
      animationId = requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
    }
    render()

    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      const newAspect = width / height
      renderer.setSize(width, height)
      camera.left = -s * newAspect
      camera.right = s * newAspect
      camera.top = s
      camera.bottom = -s
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      controls.dispose()
      renderer.dispose()
      cubeGeo.dispose()
      sphereGeo.dispose()
      cube.material.dispose() 
      sphere.material.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100%", position: "relative" }} 
    />
  )
})

export default ThreeView